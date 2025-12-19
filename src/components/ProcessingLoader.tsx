import { useEffect, useState } from 'react';
import { Check, Loader2 } from 'lucide-react';

interface Step {
  label: string;
  duration: number;
}

const steps: Step[] = [
  { label: 'Fetching repository', duration: 2000 },
  { label: 'Analyzing code structure', duration: 3000 },
  { label: 'Running AI evaluation', duration: 4000 },
  { label: 'Generating insights', duration: 2000 },
];

interface ProcessingLoaderProps {
  onComplete: () => void;
}

const ProcessingLoader = ({ onComplete }: ProcessingLoaderProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);

  useEffect(() => {
    if (currentStep >= steps.length) {
      onComplete();
      return;
    }

    const stepDuration = steps[currentStep].duration;
    const progressInterval = setInterval(() => {
      setStepProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setCurrentStep((s) => s + 1);
          return 0;
        }
        return prev + 2;
      });
    }, stepDuration / 50);

    return () => clearInterval(progressInterval);
  }, [currentStep, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
      {/* Main loader */}
      <div className="relative mb-12">
        <div className="w-24 h-24 rounded-full border-4 border-muted">
          <div 
            className="w-full h-full rounded-full border-4 border-t-primary border-r-secondary border-b-accent border-l-transparent animate-spin"
            style={{ animationDuration: '1.5s' }}
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 animate-pulse" />
        </div>
      </div>

      {/* Steps */}
      <div className="w-full max-w-md space-y-4">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <div
              key={index}
              className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-500 ${
                isCurrent ? 'glass-card' : isCompleted ? 'opacity-60' : 'opacity-30'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCompleted
                    ? 'bg-score-success'
                    : isCurrent
                    ? 'bg-gradient-to-br from-primary to-secondary'
                    : 'bg-muted'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 text-background" />
                ) : isCurrent ? (
                  <Loader2 className="w-5 h-5 text-primary-foreground animate-spin" />
                ) : (
                  <span className="text-sm text-muted-foreground">{index + 1}</span>
                )}
              </div>
              <div className="flex-1">
                <p className={`font-medium ${isCurrent ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {step.label}
                </p>
                {isCurrent && (
                  <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-200"
                      style={{ width: `${stepProgress}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProcessingLoader;
