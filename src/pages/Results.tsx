import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AnimatedBackground from '@/components/AnimatedBackground';
import Navbar from '@/components/Navbar';
import ScoreRing from '@/components/ScoreRing';

const mockResults = {
  score: 72,
  strengths: [
    'Clean code structure and organization',
    'Good use of TypeScript for type safety',
    'Consistent coding style throughout',
  ],
  weaknesses: [
    'Missing comprehensive test coverage',
    'Documentation could be improved',
    'No CI/CD pipeline configured',
  ],
  summary:
    'This repository demonstrates solid fundamentals with clean code organization and good TypeScript usage. However, there is room for improvement in testing coverage and documentation. Adding automated testing and CI/CD would significantly enhance the project quality.',
  breakdown: [
    { label: 'Code Quality', score: 78 },
    { label: 'Documentation', score: 55 },
    { label: 'Testing', score: 42 },
    { label: 'Git Practices', score: 85 },
    { label: 'Real-World Relevance', score: 80 },
  ],
};

const Results = () => {
  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      <Navbar />

      <main className="pt-24 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-12 animate-fade-in">
            Analysis <span className="gradient-text">Results</span>
          </h1>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Score Section */}
            <div className="glass-card p-8 flex flex-col items-center justify-center animate-fade-in">
              <ScoreRing score={mockResults.score} />
            </div>

            {/* AI Summary */}
            <div className="glass-card p-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                AI Summary
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {mockResults.summary}
              </p>

              {/* Strengths */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-score-success mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Strengths
                </h3>
                <ul className="space-y-2">
                  {mockResults.strengths.map((strength, index) => (
                    <li
                      key={index}
                      className="text-sm text-muted-foreground pl-4 border-l-2 border-score-success/30"
                    >
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div>
                <h3 className="text-sm font-medium text-score-warning mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Areas for Improvement
                </h3>
                <ul className="space-y-2">
                  {mockResults.weaknesses.map((weakness, index) => (
                    <li
                      key={index}
                      className="text-sm text-muted-foreground pl-4 border-l-2 border-score-warning/30"
                    >
                      {weakness}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="glass-card p-8 mt-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <h2 className="text-xl font-semibold text-foreground mb-6">Score Breakdown</h2>
            <div className="space-y-4">
              {mockResults.breakdown.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground w-40">{item.label}</span>
                  <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-1000"
                      style={{
                        width: `${item.score}%`,
                        animationDelay: `${index * 100}ms`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground w-12 text-right">
                    {item.score}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <Link to="/roadmap">
              <Button variant="hero" size="lg">
                View Improvement Roadmap
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/repo-details">
              <Button variant="glass" size="lg">
                Repository Details
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Results;
