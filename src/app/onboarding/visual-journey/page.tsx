'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle2, Heart } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Heading, Text } from '../../../components/ui/Typography';

// Base categories that are common to all genders
const baseStyleCategories = [
  { id: 'casual', label: 'Casual', images: ['/images/casual/6%20Male%20Casual%20Attire.png', '/images/casual/5%20female%20Casual%20Fashion.png'], description: 'Everyday comfort with a relaxed vibe' },
  { id: 'professional', label: 'Professional', images: ['/images/Professional/%208%20male%20Professional.png', '/images/Professional/7%20Female%20Professional.png'], description: 'Polished looks for the workplace' },
  { id: 'bohemian', label: 'Bohemian', images: ['/images/bohemian/%204%20male%20Bohemian%20Look.png', '/images/bohemian/9%20Female%20Bohemian.png'], description: 'Free-spirited with artistic flair' },
  { id: 'minimalist', label: 'Minimalist', images: ['/images/Minimalist/11%20male%20minimalist.png', '/images/Minimalist/14%20female%20Minimalist%20Fashion%20Style.png'], description: 'Clean lines and understated elegance' },
  { id: 'vintage', label: 'Vintage', images: ['/images/vintage/15%20male%20Vintage%20Style%20.png', '/images/vintage/13%20female%20Vintage%20Style%20Portrait.png'], description: 'Timeless styles from the past' },
  { id: 'glamorous', label: 'Glamorous', images: ['/images/Glamorous/10%20male%20Glamorous%20Style.png', '/images/Glamorous/12%20female%20Glamorous%20Style.png'], description: 'Bold, eye-catching statement pieces' },
  { id: 'athleisure', label: 'Athleisure', images: ['/images/athleisure/1%20male%20athletic%20wear.png', '/images/athleisure/2%20female%20athletic%20wear.png'], description: 'Athletic meets leisure for active lifestyles' },
  { id: 'streetwear', label: 'Streetwear', images: ['/images/streetwear/16%20male%20Streetwear%20Style.png', '/images/streetwear/3%20female%20Streetwear.png'], description: 'Urban-inspired casual coolness' },
];

// Gender-specific style options (now empty since we moved streetwear to base categories)
const genderSpecificStyles = {
  man: [],
  woman: [],
  // Add other gender-specific categories as needed
};

export default function VisualJourney() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const gender = searchParams.get('gender') || '';
  const [allStyles, setAllStyles] = useState<Array<{category: string, label: string, image: string, description: string}>>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Initialize all styles in a flat array for carousel view
  useEffect(() => {
    let stylesToShow = [...baseStyleCategories];
    
    // Add gender-specific styles if available
    if (gender && genderSpecificStyles[gender as keyof typeof genderSpecificStyles]) {
      stylesToShow = [
        ...genderSpecificStyles[gender as keyof typeof genderSpecificStyles],
        ...stylesToShow
      ];
    }

    // Filter images based on gender
    let flattenedStyles = [];
    if (gender === 'man') {
      // For men, only show male images
      flattenedStyles = stylesToShow.flatMap(category => {
        const maleImages = category.images.filter(img => 
          img.toLowerCase().includes('male') && !img.toLowerCase().includes('female')
        );
        return maleImages.map(image => ({
          category: category.id,
          label: category.label,
          image,
          description: category.description || ''
        }));
      });
    } else if (gender === 'woman') {
      // For women, only show female images
      flattenedStyles = stylesToShow.flatMap(category => {
        const femaleImages = category.images.filter(img => 
          img.toLowerCase().includes('female')
        );
        return femaleImages.map(image => ({
          category: category.id,
          label: category.label,
          image,
          description: category.description || ''
        }));
      });
    } else {
      // For other genders, show all images
      flattenedStyles = stylesToShow.flatMap(category => 
        category.images.map(image => ({
          category: category.id,
          label: category.label,
          image,
          description: category.description || ''
        }))
      );
    }
    
    setAllStyles(flattenedStyles);
  }, [gender]);

  const handleStyleSelect = () => {
    const styleId = `${allStyles[currentIndex].category}-${currentIndex}`;
    setSelectedStyles(prev => {
      if (prev.includes(styleId)) {
        return prev.filter(id => id !== styleId);
      } else {
        return [...prev, styleId];
      }
    });
    
    // Move to next style if not at the end
    if (currentIndex < allStyles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCompleted(true);
    }
  };

  const handleNextStyle = () => {
    if (currentIndex < allStyles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCompleted(true);
    }
  };

  const handlePrevStyle = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleContinue = () => {
    if (selectedStyles.length > 0) {
      setIsSubmitting(true);
      
      // In a real application, you would save this data to a database
      const userPreferences = {
        gender,
        styles: selectedStyles,
      };
      
      // For demo, save the user data to localStorage
      const userData = {
        name: 'User', // This would come from the signup form in a real app
        gender,
        preferences: selectedStyles,
        authenticated: true
      };
      
      // Store the user data in localStorage for use on the dashboard
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Set a mock authentication cookie
      document.cookie = 'authenticated=true; path=/';
      
      // Navigate to the feed page after a short delay
      setTimeout(() => {
        router.push('/style-feed');
      }, 800);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Progress header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-gray-100">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/onboarding/gender-selection" className="text-text-secondary hover:text-text-primary">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          
          <div className="flex-1 mx-4">
            <div className="bg-gray-200 h-2 w-full rounded-full">
              <div 
                className="bg-primary-main h-2 rounded-full transition-all"
                style={{ width: `${Math.min(100, (currentIndex / Math.max(1, allStyles.length)) * 100)}%` }}
              />
            </div>
          </div>
          
          <div className="text-sm font-medium">
            {currentIndex + 1}/{allStyles.length}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {/* Main content */}
        <div className="container mx-auto px-4 py-6 flex-1 flex flex-col">
          <div className="mb-6 text-center">
            <Heading level={2} className="mb-2">
              Find Your Style
            </Heading>
            <Text>
              Like the styles that resonate with you
            </Text>
          </div>
          
          {allStyles.length > 0 && (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="w-full max-w-md aspect-[3/4] relative overflow-hidden rounded-2xl shadow-lg mb-6">
                <img 
                  src={allStyles[currentIndex].image} 
                  alt={`${allStyles[currentIndex].label} style`}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                  {allStyles[currentIndex].label}
                </div>
                
                {selectedStyles.includes(`${allStyles[currentIndex].category}-${currentIndex}`) && (
                  <div className="absolute top-4 right-4">
                    <Heart className="h-8 w-8 text-red-500 fill-red-500" />
                  </div>
                )}
                
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <Text className="text-white text-sm">
                    {allStyles[currentIndex].description}
                  </Text>
                </div>
              </div>
              
              <div className="flex items-center justify-center space-x-4 mb-8">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handlePrevStyle}
                  disabled={currentIndex === 0}
                  className="rounded-full h-12 w-12 p-0"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                
                <Button 
                  variant={selectedStyles.includes(`${allStyles[currentIndex].category}-${currentIndex}`) ? "outline" : "primary"}
                  size="lg"
                  onClick={handleStyleSelect}
                  className="rounded-full min-w-[200px]"
                >
                  {selectedStyles.includes(`${allStyles[currentIndex].category}-${currentIndex}`) ? 'Liked' : 'Like This Style'}
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleNextStyle}
                  disabled={currentIndex === allStyles.length - 1}
                  className="rounded-full h-12 w-12 p-0"
                >
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="border-t border-gray-100 bg-gray-50">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Text className="text-text-secondary">
              {selectedStyles.length} styles liked
            </Text>
            
            <Button
              variant="primary"
              onClick={handleContinue}
              disabled={selectedStyles.length === 0 || isSubmitting}
              isLoading={isSubmitting}
            >
              {completed ? 'Complete' : 'Continue'} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Skip modal - could be implemented if needed */}
    </div>
  );
} 