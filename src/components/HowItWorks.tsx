import { Link2, Search, Brain, Map } from 'lucide-react';

const steps = [
  {
    icon: Link2,
    title: 'Paste GitHub URL',
    description: 'Simply paste any public GitHub repository URL to get started.',
  },
  {
    icon: Search,
    title: 'Analyze Repository',
    description: 'Our system fetches and processes the repository structure and code.',
  },
  {
    icon: Brain,
    title: 'AI Evaluation',
    description: 'Advanced AI analyzes code quality, patterns, and best practices.',
  },
  {
    icon: Map,
    title: 'Roadmap Generated',
    description: 'Receive a personalized improvement roadmap and detailed insights.',
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get comprehensive insights in four simple steps
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Timeline line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-secondary to-accent hidden md:block" />

          <div className="space-y-12">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex items-center gap-8 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                } flex-col md:flex-row`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Content */}
                <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'} text-center`}>
                  <div className="glass-card p-6 inline-block">
                    <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
                    <p className="text-muted-foreground text-sm">{step.description}</p>
                  </div>
                </div>

                {/* Icon */}
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                    <step.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium text-muted-foreground">
                    Step {index + 1}
                  </span>
                </div>

                {/* Spacer for alternating layout */}
                <div className="flex-1 hidden md:block" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
