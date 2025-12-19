import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AnimatedBackground from '@/components/AnimatedBackground';
import Navbar from '@/components/Navbar';
import RoadmapTimeline from '@/components/RoadmapTimeline';

const Roadmap = () => {
  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      <Navbar />

      <main className="pt-24 pb-20 px-6">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Improvement <span className="gradient-text">Roadmap</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A personalized action plan to level up your repository based on AI analysis
            </p>
          </div>

          {/* Timeline */}
          <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
            <RoadmapTimeline />
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <Link to="/results">
              <Button variant="glass" size="lg">
                <ArrowLeft className="w-5 h-5" />
                Back to Results
              </Button>
            </Link>
            <Link to="/analyze">
              <Button variant="hero" size="lg">
                Analyze Another Repo
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Roadmap;
