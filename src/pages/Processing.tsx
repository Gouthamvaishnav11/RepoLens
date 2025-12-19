import { useNavigate } from 'react-router-dom';
import AnimatedBackground from '@/components/AnimatedBackground';
import Navbar from '@/components/Navbar';
import ProcessingLoader from '@/components/ProcessingLoader';

const Processing = () => {
  const navigate = useNavigate();

  const handleComplete = () => {
    navigate('/results');
  };

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      <Navbar />

      <main className="pt-24">
        <ProcessingLoader onComplete={handleComplete} />
      </main>
    </div>
  );
};

export default Processing;
