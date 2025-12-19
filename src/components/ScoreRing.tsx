import { useEffect, useState } from 'react';

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

const ScoreRing = ({ score, size = 200, strokeWidth = 12 }: ScoreRingProps) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  const getScoreColor = () => {
    if (score >= 80) return 'hsl(var(--score-gold))';
    if (score >= 60) return 'hsl(var(--score-silver))';
    return 'hsl(var(--score-bronze))';
  };

  const getSkillLevel = () => {
    if (score >= 80) return 'Advanced';
    if (score >= 60) return 'Intermediate';
    return 'Beginner';
  };

  const getBadge = () => {
    if (score >= 80) return { label: 'Gold', color: 'from-yellow-400 to-amber-600' };
    if (score >= 60) return { label: 'Silver', color: 'from-gray-300 to-gray-500' };
    return { label: 'Bronze', color: 'from-orange-400 to-orange-700' };
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const increment = score / 50;
      const interval = setInterval(() => {
        setAnimatedScore((prev) => {
          if (prev >= score) {
            clearInterval(interval);
            return score;
          }
          return Math.min(prev + increment, score);
        });
      }, 20);
      return () => clearInterval(interval);
    }, 300);
    return () => clearTimeout(timer);
  }, [score]);

  const badge = getBadge();

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="score-ring">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={getScoreColor()}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 10px ${getScoreColor()})`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-bold text-foreground">
            {Math.round(animatedScore)}
          </span>
          <span className="text-sm text-muted-foreground mt-1">out of 100</span>
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-xl font-semibold text-foreground mb-2">{getSkillLevel()}</p>
        <div className={`inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r ${badge.color} text-background font-medium text-sm shadow-lg`}>
          {badge.label} Badge
        </div>
      </div>
    </div>
  );
};

export default ScoreRing;
