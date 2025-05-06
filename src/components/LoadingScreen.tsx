import React, { useEffect, useState } from 'react';
import { Heading, Text } from './ui/Typography';

interface LoadingScreenProps {
  userName?: string;
  onComplete: () => void;
}

export function LoadingScreen({ userName = 'there', onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const messages = [
      'Getting everything ready for you...',
      'Curating your personalized wardrobe...',
      'Tailoring your style suggestions...',
      'Loading your fashion journey...',
    ];

    // Randomly select a message
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setMessage(randomMessage);

    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + Math.random() * 15;
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => onComplete(), 500); // Give a small delay before completing
          return 100;
        }
        return newProgress;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center p-6 z-50">
      <div className="w-full max-w-md mx-auto text-center">
        <Heading level={2} className="mb-6 text-3xl font-bold">
          Welcome, {userName}!
        </Heading>
        
        <div className="relative h-2 w-full bg-gray-200 rounded-full overflow-hidden mb-4">
          <div 
            className="absolute top-0 left-0 h-full bg-primary-main rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <Text className="text-text-secondary mb-8">
          {message}
        </Text>
        
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-main"></div>
        </div>
      </div>
    </div>
  );
} 