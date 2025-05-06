'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, User, Users } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Heading, Text } from '../../../components/ui/Typography';

const genderOptions = [
  { id: 'woman', label: 'Woman', icon: Users },
  { id: 'man', label: 'Man', icon: User },
];

export default function GenderSelection() {
  const router = useRouter();
  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGenderSelect = (genderId: string) => {
    setSelectedGender(genderId);
  };

  const handleContinue = () => {
    if (selectedGender) {
      setIsSubmitting(true);
      // Simulate API call with timeout
      setTimeout(() => {
        // Navigate to the visual journey page after selection
        router.push(`/onboarding/visual-journey?gender=${selectedGender}`);
      }, 800);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md">
        <Link href="/onboarding/interests" className="text-text-secondary hover:text-text-primary inline-flex items-center mb-8">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </Link>
        
        <div className="text-center mb-8">
          <Heading level={1} className="mb-2">
            Select Your Gender
          </Heading>
          <Text>
            This helps us personalize your style recommendations
          </Text>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
          {genderOptions.map((gender) => (
            <Card 
              key={gender.id}
              className={`flex flex-col items-center p-6 cursor-pointer transition-all hover:border-primary-main ${
                selectedGender === gender.id ? 'border-primary-main ring-2 ring-primary-light' : ''
              }`}
              onClick={() => handleGenderSelect(gender.id)}
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-primary-light mb-3">
                {React.createElement(gender.icon, { 
                  className: "h-8 w-8 text-primary-main",
                  strokeWidth: 2
                })}
              </div>
              <Text className="text-lg font-medium">{gender.label}</Text>
              {selectedGender === gender.id && (
                <div className="absolute top-3 right-3">
                  <Check className="h-5 w-5 text-primary-main" />
                </div>
              )}
            </Card>
          ))}
        </div>
      
        <div className="mt-8 flex justify-between w-full">
          <Button
            onClick={handleContinue}
            disabled={!selectedGender || isSubmitting}
            isLoading={isSubmitting}
            className="w-full"
          >
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 