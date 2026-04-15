import os
import ast
import json
import requests
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from groq import Groq
from concurrent.futures import ThreadPoolExecutor
from functools import lru_cache
from flask_sqlalchemy import SQLAlchemy


# SETUP
load_dotenv()

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY not found")

client = Groq(api_key=GROQ_API_KEY)

app = Flask(__name__)
CORS(app)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///repolens.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)

session = requests.Session()

HEADERS = {"Authorization": f"token {GITHUB_TOKEN}"} if GITHUB_TOKEN else {}

LATEST_RESULT = {}
LATEST_METRICS = {}
LATEST_REPO_INFO = {}


class Repository(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    repo_url = db.Column(db.String(300), unique=True)
    owner = db.Column(db.String(100))
    name = db.Column(db.String(100))
    last_commit_sha = db.Column(db.String(100))


class Analysis(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    repo_id = db.Column(db.Integer, db.ForeignKey("repository.id"))
    score = db.Column(db.Integer)
    summary = db.Column(db.Text)
    strengths = db.Column(db.Text)
    weaknesses = db.Column(db.Text)
    breakdown = db.Column(db.Text)
    roadmap = db.Column(db.Text)
    commit_sha = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# HELPERS

def parse_repo_url(repo_url: str):
    parts = repo_url.rstrip("/").split("/")
    if len(parts) < 2:
        raise ValueError("Invalid GitHub repository URL")
    return parts[-2], parts[-1]

def get_latest_commit_sha(owner, repo):
    try:
        # Get repo info (to know default branch)
        repo_url = f"https://api.github.com/repos/{owner}/{repo}"
        repo_res = session.get(repo_url, headers=HEADERS, timeout=10)

        if repo_res.status_code != 200:
            print("Repo error:", repo_res.text)
            return None

        default_branch = repo_res.json().get("default_branch", "main")

        # Get latest commit from that branch
        commit_url = f"https://api.github.com/repos/{owner}/{repo}/commits/{default_branch}"
        commit_res = session.get(commit_url, headers=HEADERS, timeout=10)

        if commit_res.status_code != 200:
            print("Commit error:", commit_res.text)
            return None

        return commit_res.json().get("sha")

    except Exception as e:
        print("SHA error:", e)
        return None

def fetch_repo_contents(owner, repo, path="", ref=None):
    url = f"https://api.github.com/repos/{owner}/{repo}/contents/{path}"
    
    if ref:
        url += f"?ref={ref}"

    r = session.get(url, headers=HEADERS, timeout=15)
    r.raise_for_status()
    return r.json()

def fetch_file_content(download_url):
    try:
        r = session.get(download_url, headers=HEADERS, timeout=15)
        r.raise_for_status()
        return r.text
    except:
        return ""
    
def is_text_file(content):
    try:
        content.encode("utf-8")
        return True
    except:
        return False

def fetch_multiple_files(file_items):
    with ThreadPoolExecutor(max_workers=10) as executor:
        return list(
            executor.map(
                lambda item: fetch_file_content(item.get("download_url", "")),
                file_items
            )
        )

def walk_repo(owner, repo, path="", ref=None, depth=0, max_depth=5):
    try:
        items = fetch_repo_contents(owner, repo, path, ref)
    except:
        return []

    files = []

    for item in items:
        if item["type"] == "file":
            files.append(item)
        elif item["type"] == "dir" and depth < max_depth:
            files.extend(
                walk_repo(owner, repo, item["path"], ref, depth + 1)
            )

    return files

def fetch_commits(owner, repo):
    url = f"https://api.github.com/repos/{owner}/{repo}/commits?per_page=1"
    r = session.get(url, headers=HEADERS)
    if "Link" in r.headers:
       link = r.headers["Link"]
       last_page = link.split("page=")[-1].split(">")[0]
       return int(last_page)
    return 1


def get_performance_level(score):

    if score >= 80:
        return "Best"

    elif score >= 50:
        return "Average"

    else:
        return "Needs Improvement"
    


# ANALYSIS

def analyze_repository(repo_url):
    owner, repo = parse_repo_url(repo_url)
    files = walk_repo(owner, repo)

    metrics = {
        "lines": 0,
        "functions": 0,
        "has_readme": False,
        "has_tests": False,
        "commit_count": 0,
        "file_structure": [],
        "languages": {}
    }

    ext_to_lang = {
        ".py": "Python",
        ".js": "JavaScript",
        ".ts": "TypeScript",
        ".css": "CSS",
        ".html": "HTML",
        ".java": "Java",
        ".cpp": "C++",
        ".c": "C",
        ".go": "Go",
        ".rs": "Rust",
        ".php": "PHP",
        ".rb": "Ruby",
        ".kt": "Kotlin",
        ".swift": "Swift"
    }

    file_nodes = []

    for item in files:
        name = item["name"]
        lname = name.lower()

        if lname.startswith("readme"):
            metrics["has_readme"] = True

        if "test" in lname:
            metrics["has_tests"] = True

        file_nodes.append({
            "name": name,
            "type": item["type"],
            "path": item["path"]
        })

        ext = os.path.splitext(name)[1]
        lang = ext_to_lang.get(ext)
        if lang:
            metrics["languages"][lang] = metrics["languages"].get(lang, 0) + 1

    contents = fetch_multiple_files(files)

    for item, code in zip(files, contents):
        if not code or not is_text_file(code):
            continue

        name = item["name"].lower()
        metrics["lines"] += len(code.splitlines())

        if name.startswith("readme"):
            metrics["has_readme"] = True
        if "test" in name:
            metrics["has_tests"] = True

        if name.endswith(".py"):
            try:
                tree = ast.parse(code)
                metrics["functions"] += sum(
                    isinstance(n, ast.FunctionDef) for n in ast.walk(tree)
                )
            except:
                pass

    metrics["commit_count"] = fetch_commits(owner, repo)

    total_files = sum(metrics["languages"].values()) or 1
    metrics["languages"] = [
        {"name": k, "percentage": int(v / total_files * 100), "color": "#3178c6"}
        for k, v in metrics["languages"].items()
    ]

    metrics["file_structure"] = file_nodes

    LATEST_REPO_INFO.update({
        "owner": owner,
        "name": repo,
        "languages": metrics["languages"],
        "commits": metrics["commit_count"],
        "lastUpdated": "Just now",
        "hasTests": metrics["has_tests"],
        "testFramework": "pytest" if metrics["has_tests"] else "",
        "fileStructure": metrics["file_structure"]
    })

    return metrics

# SCORING

def calculate_scores(metrics):
    avg_func_size = metrics["lines"] / max(metrics["functions"], 1)
    code_quality = 90 if avg_func_size < 30 else 60
    documentation = 85 if metrics["has_readme"] else 35
    testing = 75 if metrics["has_tests"] else 30
    git_practices = min(metrics["commit_count"] * 5, 100)
    real_world = 75

    final_score = int(
        0.25 * code_quality
        + 0.15 * documentation
        + 0.15 * testing
        + 0.15 * git_practices
        + 0.15 * real_world
    )

    breakdown = [
        {"label": "Code Quality", "score": code_quality},
        {"label": "Documentation", "score": documentation},
        {"label": "Testing", "score": testing},
        {"label": "Git Practices", "score": git_practices},
        {"label": "Real-World Relevance", "score": real_world},
    ]

    return final_score, breakdown

# AI HELPERS

def safe_json_from_ai(text):
    try:
        text = text.strip()
        start = text.find("{")
        end = text.rfind("}") + 1
        return json.loads(text[start:end])
    except:
        return {}

def generate_ai_summary(metrics, score):
    prompt = f"""
ROLE:
You are a senior software engineer and technical interviewer evaluating a GitHub repository.

GOAL:
Provide an objective, concise evaluation for a recruiter or developer.

CONTEXT:
- Lines of code: {metrics['lines']}
- Number of functions: {metrics['functions']}
- README file present: {metrics['has_readme']}
- Tests present: {metrics['has_tests']}
- Commit count: {metrics['commit_count']}
- Programming languages used: {[l['name'] for l in metrics['languages']]}

INSTRUCTIONS:
Return strictly valid JSON:
{{
  "summary": "string",
  "strengths": ["string","string","string"],
  "weaknesses": ["string","string","string"]
}}
"""
    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
        )
        return safe_json_from_ai(response.choices[0].message.content)
    except Exception as e:
        print("Groq summary error:", e)
        return {"summary": "AI analysis unavailable.", "strengths": [], "weaknesses": []}

def generate_ai_roadmap(metrics):
    prompt = f"""
ROLE:
You are a senior software engineering mentor and technical interviewer who creates actionable improvement roadmaps.

GOAL:
Provide a step-by-step roadmap to improve code quality, testing, and documentation based strictly on the repository metrics.

CONTEXT:
- Lines of code: {metrics['lines']}
- Number of functions: {metrics['functions']}
- README present: {metrics['has_readme']}
- Tests present: {metrics['has_tests']}
- Commit count: {metrics['commit_count']}
- Programming languages: {[l['name'] for l in metrics['languages']]}

INSTRUCTIONS:
1. Base all suggestions strictly on the given metrics.
2. Provide 3 categories: short-term (1-7 days), mid-term (2-4 weeks), long-term (1-3 months).
3. Each roadmap item must have:
   - title: short and clear
   - description: concise explanation
4. Return output strictly in JSON.

OUTPUT FORMAT:
{{
  "short_term": [{{"title":"string","description":"string"}}],
  "mid_term": [{{"title":"string","description":"string"}}],
  "long_term": [{{"title":"string","description":"string"}}]
}}
"""
    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
        )
        return safe_json_from_ai(response.choices[0].message.content)
    except Exception as e:
        print("Groq roadmap error:", e)
        return {"short_term": [], "mid_term": [], "long_term": []}

# RISK PREDICTION

def predict_risks(metrics):
    risks = {}
    risks["testing"] = "high" if not metrics["has_tests"] else "low"
    risks["documentation"] = "high" if not metrics["has_readme"] else "low"
    risks["code_complexity"] = "high" if metrics["lines"] / max(metrics["functions"], 1) > 50 else "low"
    risks["commit_risk"] = "medium" if metrics["commit_count"] < 5 else "low"

    overall = sum([90 if v == "high" else 50 if v == "medium" else 10 for v in risks.values()]) / len(risks)
    risks["overall_risk_score"] = int(overall)

    return risks

# ROUTES

@app.route("/api/analyze", methods=["POST"])
def analyze():
    global LATEST_RESULT, LATEST_METRICS

    repo_url = request.json.get("repo_url")
    if not repo_url:
        return jsonify({"error": "repo_url required"}), 400

    owner, repo = parse_repo_url(repo_url)

    # 🔑 Get latest commit
    latest_sha = get_latest_commit_sha(owner, repo)
    if not latest_sha:
        return jsonify({"error": "Unable to fetch latest commit"}), 400

    repo_obj = Repository.query.filter_by(repo_url=repo_url).first()

    # CHECK EXISTING
    if repo_obj:
        last_analysis = Analysis.query.filter_by(repo_id=repo_obj.id)\
            .order_by(Analysis.created_at.desc()).first()

        # ✅ SAME COMMIT → RETURN CACHED
        if last_analysis and last_analysis.commit_sha == latest_sha:
            LATEST_RESULT = {
                "score": last_analysis.score,
                "performance": get_performance_level(last_analysis.score),
                "summary": last_analysis.summary,
                "strengths": json.loads(last_analysis.strengths or "[]"),
                "weaknesses": json.loads(last_analysis.weaknesses or "[]"),
                "breakdown": json.loads(last_analysis.breakdown or "[]"),
                "roadmap": json.loads(last_analysis.roadmap or "{}"),
                "message": "Cached result (no new commits)"
            }
            return jsonify(LATEST_RESULT)

    else:
        # 🆕 Create new repo entry
        repo_obj = Repository(
            repo_url=repo_url,
            owner=owner,
            name=repo,
            last_commit_sha=latest_sha
        )
        db.session.add(repo_obj)
        db.session.commit()

    #  NEW ANALYSIS 
    metrics = analyze_repository(repo_url)

    score, breakdown = calculate_scores(metrics)   # ✅ use proper scoring
    summary = generate_ai_summary(metrics, score)
    roadmap = generate_ai_roadmap(metrics)

    # 💾 SAVE
    new_analysis = Analysis(
        repo_id=repo_obj.id,
        score=score,
        summary=summary.get("summary", ""),
        strengths=json.dumps(summary.get("strengths", [])),
        weaknesses=json.dumps(summary.get("weaknesses", [])),
        breakdown=json.dumps(breakdown),
        roadmap=json.dumps(roadmap),
        commit_sha=latest_sha
    )

    # 🔄 Update repo latest commit
    repo_obj.last_commit_sha = latest_sha

    db.session.add(new_analysis)
    db.session.commit()

    # ================== RESPONSE ==================
    LATEST_METRICS = metrics
    LATEST_RESULT = {
        "score": score,
        "performance": get_performance_level(score),
        "summary": summary.get("summary", ""),
        "strengths": summary.get("strengths", []),
        "weaknesses": summary.get("weaknesses", []),
        "breakdown": breakdown,
        "roadmap": roadmap,
        "message": "New analysis completed"
    }

    return jsonify(LATEST_RESULT)


@app.route("/api/history/<int:repo_id>")
def history(repo_id):
    data = Analysis.query.filter_by(repo_id=repo_id).all()

    return jsonify([
        {
            "score": d.score,
            "summary": d.summary,
            "strengths": json.loads(d.strengths),
            "weaknesses": json.loads(d.weaknesses),
            "roadmap": json.loads(d.roadmap),
            "commit": d.commit_sha,
            "date": d.created_at
        }
        for d in data
    ])


@app.route("/api/results")
def results():
    return jsonify(LATEST_RESULT)

@app.route("/api/roadmap")
def roadmap():
    return jsonify(generate_ai_roadmap(LATEST_METRICS))

@app.route("/api/repo-details")
def repo_details():
    if not LATEST_REPO_INFO:
        return jsonify({"error": "No repository analyzed yet"}), 404
    return jsonify(LATEST_REPO_INFO)

@app.route("/api/risks")
def risks():
    if not LATEST_METRICS:
        return jsonify({"error": "No repository analyzed yet"}), 404
    return jsonify(predict_risks(LATEST_METRICS))

# RUN

if __name__ == "__main__":
    app.run(debug=True, port=5000)