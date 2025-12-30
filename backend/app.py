import os
import ast
import json
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from groq import Groq

#  SETUP 
load_dotenv()

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY not found")

client = Groq(api_key=GROQ_API_KEY)

app = Flask(__name__)
CORS(app)

HEADERS = {"Authorization": f"token {GITHUB_TOKEN}"} if GITHUB_TOKEN else {}

LATEST_RESULT = {}
LATEST_METRICS = {}
LATEST_REPO_INFO = {}

#  HELPERS 
def parse_repo_url(repo_url: str):
    parts = repo_url.rstrip("/").split("/")
    if len(parts) < 2:
        raise ValueError("Invalid GitHub repository URL")
    return parts[-2], parts[-1]

def fetch_repo_contents(owner, repo, path=""):
    url = f"https://api.github.com/repos/{owner}/{repo}/contents/{path}"
    r = requests.get(url, headers=HEADERS, timeout=15)
    r.raise_for_status()
    return r.json()

def fetch_file_content(download_url):
    r = requests.get(download_url, headers=HEADERS, timeout=15)
    r.raise_for_status()
    return r.text

def walk_repo(owner, repo, path=""):
    items = fetch_repo_contents(owner, repo, path)
    files = []
    for item in items:
        if item["type"] == "file":
            files.append(item)
        elif item["type"] == "dir":
            files.extend(walk_repo(owner, repo, item["path"]))
    return files

def fetch_commits(owner, repo):
    url = f"https://api.github.com/repos/{owner}/{repo}/commits"
    r = requests.get(url, headers=HEADERS, timeout=15)
    r.raise_for_status()
    return r.json()

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

    ext_to_lang = {".py": "Python", ".js": "JavaScript", ".ts": "TypeScript", ".css": "CSS", ".html": "HTML"}
    file_nodes = []

    for item in files:
        name = item["name"]
        lname = name.lower()

        if lname.startswith("readme"):
            metrics["has_readme"] = True
        if "test" in lname:
            metrics["has_tests"] = True

        if name.endswith(".py"):
            code = fetch_file_content(item["download_url"])
            metrics["lines"] += len(code.splitlines())
            try:
                tree = ast.parse(code)
                metrics["functions"] += sum(isinstance(n, ast.FunctionDef) for n in ast.walk(tree))
            except SyntaxError:
                pass

        file_nodes.append({"name": name, "type": item["type"], "path": item["path"]})

        ext = os.path.splitext(name)[1]
        lang = ext_to_lang.get(ext)
        if lang:
            metrics["languages"][lang] = metrics["languages"].get(lang, 0) + 1

    metrics["commit_count"] = len(fetch_commits(owner, repo))
    total_files = sum(metrics["languages"].values()) or 1
    metrics["languages"] = [{"name": k, "percentage": int(v / total_files * 100), "color": "#3178c6"} for k,v in metrics["languages"].items()]
    metrics["file_structure"] = file_nodes

    # Save repo info for frontend
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

#  SCORING 
def calculate_scores(metrics):
    avg_func_size = metrics["lines"] / max(metrics["functions"], 1)
    code_quality = 90 if avg_func_size < 30 else 60
    documentation = 85 if metrics["has_readme"] else 35
    testing = 75 if metrics["has_tests"] else 30
    git_practices = min(metrics["commit_count"] * 5, 100)
    real_world = 75

    final_score = int(0.25*code_quality + 0.15*documentation + 0.15*testing + 0.15*git_practices + 0.15*real_world)
    breakdown = [
        {"label": "Code Quality", "score": code_quality},
        {"label": "Documentation", "score": documentation},
        {"label": "Testing", "score": testing},
        {"label": "Git Practices", "score": git_practices},
        {"label": "Real-World Relevance", "score": real_world}
    ]
    return final_score, breakdown

#  AI HELPERS 
def safe_json_from_ai(text):
    try:
        text = text.strip()
        start = text.find("{")
        end = text.rfind("}") + 1
        return json.loads(text[start:end])
    except Exception:
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
            messages=[{"role":"user","content":prompt}],
            temperature=0.3
        )
        return safe_json_from_ai(response.choices[0].message.content)
    except Exception as e:
        print("Groq summary error:", e)
        return {"summary":"AI analysis unavailable.","strengths":[],"weaknesses":[]}

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
            messages=[{"role":"user","content":prompt}],
            temperature=0.3
        )
        return safe_json_from_ai(response.choices[0].message.content)
    except Exception as e:
        print("Groq roadmap error:", e)
        return {"short_term":[],"mid_term":[],"long_term":[]}


#  RISK PREDICTION 
def predict_risks(metrics):
    risks = {}
    risks["testing"] = "high" if not metrics["has_tests"] else "low"
    risks["documentation"] = "high" if not metrics["has_readme"] else "low"
    risks["code_complexity"] = "high" if metrics["lines"]/max(metrics["functions"],1) > 50 else "low"
    risks["commit_risk"] = "medium" if metrics["commit_count"] < 5 else "low"
    overall = sum([90 if v=="high" else 50 if v=="medium" else 10 for v in risks.values()])/len(risks)
    risks["overall_risk_score"] = int(overall)
    return risks

#  ROUTES
@app.route("/api/analyze", methods=["POST"])
def analyze():
    global LATEST_RESULT, LATEST_METRICS
    repo_url = request.json.get("repo_url")
    if not repo_url:
        return jsonify({"error":"repo_url required"}), 400
    metrics = analyze_repository(repo_url)
    score, breakdown = calculate_scores(metrics)
    ai_summary = generate_ai_summary(metrics, score)
    LATEST_METRICS = metrics
    LATEST_RESULT = {
        "score": score,
        "summary": ai_summary.get("summary","AI analysis unavailable."),
        "strengths": ai_summary.get("strengths",[]),
        "weaknesses": ai_summary.get("weaknesses",[]),
        "breakdown": breakdown
    }
    return jsonify({"status":"analysis_complete"})

@app.route("/api/results")
def results():
    return jsonify(LATEST_RESULT)

@app.route("/api/roadmap")
def roadmap():
    return jsonify(generate_ai_roadmap(LATEST_METRICS))

@app.route("/api/repo-details")
def repo_details():
    if not LATEST_REPO_INFO:
        return jsonify({"error":"No repository analyzed yet"}), 404
    return jsonify(LATEST_REPO_INFO)

@app.route("/api/risks")
def risks():
    if not LATEST_METRICS:
        return jsonify({"error":"No repository analyzed yet"}), 404
    return jsonify(predict_risks(LATEST_METRICS))

#  RUN
if __name__ == "__main__":
    app.run(debug=True,port=5000)
