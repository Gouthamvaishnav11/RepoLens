import { Link } from 'react-router-dom';
import { ArrowRight, Github, Target, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AnimatedBackground from '@/components/AnimatedBackground';
import Navbar from '@/components/Navbar';

const About = () => {
  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      <Navbar />

      <main className="pt-24 pb-20 px-6">
        <div className="container mx-auto max-w-4xl">
          {/* Hero */}
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              About <span className="gradient-text">RepoLens</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Empowering developers to write better code through AI-powered analysis and personalized guidance
            </p>
          </div>

          {/* Mission */}
          <div className="glass-card p-8 md:p-12 mb-12 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Target className="w-6 h-6 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Our Mission</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed text-lg">
              Many developers struggle to identify areas of improvement in their code repositories.
              Traditional code reviews can be time-consuming, subjective, and often lack actionable
              insights. RepoLens bridges this gap by providing instant, objective, and comprehensive
              analysis of any GitHub repository using advanced AI technology.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <Github className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">GitHub Integration</h3>
              <p className="text-muted-foreground text-sm">
                Seamlessly analyze any public GitHub repository with just a URL. No authentication required.
              </p>
            </div>

            <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '250ms' }}>
              <Zap className="w-8 h-8 text-secondary mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">AI-Powered</h3>
              <p className="text-muted-foreground text-sm">
                Leverage cutting-edge AI models to understand code patterns, identify issues, and suggest improvements.
              </p>
            </div>

            <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
              <Users className="w-8 h-8 text-accent mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Developer Mentorship</h3>
              <p className="text-muted-foreground text-sm">
                Get personalized roadmaps and guidance tailored to your skill level and project needs.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center animate-fade-in" style={{ animationDelay: '350ms' }}>
            <Link to="/analyze">
              <Button variant="hero" size="lg">
                Try RepoLens Now
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default About;
