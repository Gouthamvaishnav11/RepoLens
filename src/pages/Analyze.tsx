import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Github, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AnimatedBackground from '@/components/AnimatedBackground';
import Navbar from '@/components/Navbar';

const Analyze = () => {
  const [url, setUrl] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateGitHubUrl = (input: string) => {
    const githubPattern = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/;
    return githubPattern.test(input);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUrl(value);
    if (value.length > 0) {
      setIsValid(validateGitHubUrl(value));
    } else {
      setIsValid(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      navigate('/processing', { state: { repoUrl: url } });
    }, 500);
  };

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      <Navbar />

      <main className="pt-32 pb-20 px-6 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-xl animate-fade-in">
          <div className="glass-card p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-6">
                <Github className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Analyze Repository
              </h1>
              <p className="text-muted-foreground">
                Paste a public GitHub repository URL to get started
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Github className="w-5 h-5 text-muted-foreground" />
                </div>
                <input
                  type="text"
                  placeholder="https://github.com/username/repository"
                  value={url}
                  onChange={handleUrlChange}
                  className={`w-full h-14 pl-12 pr-12 rounded-xl bg-muted/50 border-2 text-foreground placeholder:text-muted-foreground focus:outline-none transition-all duration-300 ${
                    isValid === null
                      ? 'border-border focus:border-primary'
                      : isValid
                      ? 'border-score-success focus:border-score-success'
                      : 'border-score-danger focus:border-score-danger'
                  }`}
                />
                {isValid !== null && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {isValid ? (
                      <CheckCircle2 className="w-5 h-5 text-score-success" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-score-danger" />
                    )}
                  </div>
                )}
              </div>

              {isValid === false && url.length > 0 && (
                <p className="text-sm text-score-danger flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Please enter a valid GitHub repository URL
                </p>
              )}

              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full"
                disabled={!isValid || isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Analyzing...
                  </div>
                ) : (
                  <>
                    Analyze Repository
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-border/50">
              <p className="text-sm text-muted-foreground text-center">
                Only public repositories are supported at this time
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analyze;
