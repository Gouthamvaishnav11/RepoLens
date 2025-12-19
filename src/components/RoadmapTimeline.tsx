import { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, Target, Lightbulb } from 'lucide-react';

interface Task {
  title: string;
  description: string;
  tools: string[];
}

interface TimelineSection {
  period: string;
  icon: typeof Clock;
  color: string;
  tasks: Task[];
}

const timelineData: TimelineSection[] = [
  {
    period: 'Short-Term (1-2 weeks)',
    icon: Clock,
    color: 'from-primary to-primary/80',
    tasks: [
      {
        title: 'Add comprehensive README documentation',
        description: 'A well-documented README increases project credibility and helps others understand your work.',
        tools: ['Markdown', 'shields.io badges'],
      },
      {
        title: 'Implement unit tests for core functions',
        description: 'Testing ensures code reliability and demonstrates professional development practices.',
        tools: ['Jest', 'React Testing Library'],
      },
    ],
  },
  {
    period: 'Mid-Term (1-2 months)',
    icon: Target,
    color: 'from-secondary to-secondary/80',
    tasks: [
      {
        title: 'Set up CI/CD pipeline',
        description: 'Automated workflows improve code quality and deployment consistency.',
        tools: ['GitHub Actions', 'Docker'],
      },
      {
        title: 'Add TypeScript strict mode',
        description: 'Stricter typing catches more bugs and improves maintainability.',
        tools: ['TypeScript', 'ESLint'],
      },
    ],
  },
  {
    period: 'Long-Term (3+ months)',
    icon: Lightbulb,
    color: 'from-accent to-accent/80',
    tasks: [
      {
        title: 'Implement performance monitoring',
        description: 'Real-time monitoring helps identify and fix production issues quickly.',
        tools: ['Sentry', 'LogRocket'],
      },
      {
        title: 'Create contribution guidelines',
        description: 'Clear guidelines encourage community contributions and maintain code quality.',
        tools: ['CONTRIBUTING.md', 'Issue templates'],
      },
    ],
  },
];

const RoadmapTimeline = () => {
  const [expandedSections, setExpandedSections] = useState<number[]>([0]);

  const toggleSection = (index: number) => {
    setExpandedSections((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="timeline-line" />

      <div className="space-y-8">
        {timelineData.map((section, sectionIndex) => {
          const isExpanded = expandedSections.includes(sectionIndex);
          const Icon = section.icon;

          return (
            <div key={sectionIndex} className="relative pl-16">
              {/* Icon */}
              <div
                className={`absolute left-0 w-12 h-12 rounded-full bg-gradient-to-br ${section.color} flex items-center justify-center shadow-lg`}
              >
                <Icon className="w-6 h-6 text-primary-foreground" />
              </div>

              {/* Content */}
              <div className="glass-card overflow-hidden">
                <button
                  onClick={() => toggleSection(sectionIndex)}
                  className="w-full p-6 flex items-center justify-between text-left hover:bg-muted/20 transition-colors"
                >
                  <h3 className="text-xl font-semibold text-foreground">{section.period}</h3>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>

                {/* Tasks */}
                <div
                  className={`overflow-hidden transition-all duration-500 ${
                    isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-6 pb-6 space-y-4">
                    {section.tasks.map((task, taskIndex) => (
                      <div
                        key={taskIndex}
                        className="p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors"
                      >
                        <h4 className="font-medium text-foreground mb-2">{task.title}</h4>
                        <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {task.tools.map((tool, toolIndex) => (
                            <span
                              key={toolIndex}
                              className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary border border-primary/20"
                            >
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoadmapTimeline;
