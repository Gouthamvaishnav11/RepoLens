import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Brain, Map, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AnimatedBackground from '@/components/AnimatedBackground';
import Navbar from '@/components/Navbar';
import FeatureCard from '@/components/FeatureCard';
import HowItWorks from '@/components/HowItWorks';

const features = [
  {
    icon: BarChart3,
    title: 'Score & Rating',
    description: 'Get a comprehensive score based on code quality, documentation, testing, and best practices.',
  },
  {
    icon: Brain,
    title: 'AI Code Review',
    description: 'Advanced AI analyzes your code patterns, architecture decisions, and suggests improvements.',
  },
  {
    icon: Map,
    title: 'Personalized Roadmap',
    description: 'Receive a tailored improvement roadmap with actionable steps to level up your repository.',
  },
];

const Index = () => {
  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-in">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium">AI-Powered Analysis</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 animate-in-delay-1">
            Repo<span className="gradient-text">Lens</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-4 animate-in-delay-2 max-w-3xl mx-auto">
            AI-Powered GitHub Repository Evaluation
          </p>

          <p className="text-lg text-muted-foreground/80 mb-12 animate-in-delay-2 max-w-2xl mx-auto">
            Turn GitHub repos into scores, insights, and improvement roadmaps.
            Get actionable feedback to level up your code.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in-delay-3">
            <Link to="/analyze">
              <Button variant="hero" size="xl" className="group">
                Analyze GitHub Repository
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="glass" size="lg">
                View How It Works
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Powerful <span className="gradient-text">Features</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive analysis tools designed to help developers improve their repositories
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={index * 100}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works">
        <HowItWorks />
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto text-center">
          <div className="glass-card p-12 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to improve your code?
            </h2>
            <p className="text-muted-foreground mb-8">
              Get started with RepoLens and discover insights about your repository today.
            </p>
            <Link to="/analyze">
              <Button variant="hero" size="lg">
                Get Started Now
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border/50">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary to-secondary" />
            <span className="font-semibold text-foreground">RepoLens</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 RepoLens. Built with AI for developers.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
