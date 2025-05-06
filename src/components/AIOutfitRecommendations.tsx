import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import { Card } from './ui/Card';
import { Heading, Text } from './ui/Typography';
import { Button } from './ui/Button';
import { StylePreference, getUserPreferences, getAIRecommendations } from '../lib/userPreferences';
import { Outfit, outfitsData } from '../lib/outfitData';

interface AIOutfitRecommendationsProps {
  title?: string;
  subtitle?: string;
  maxItems?: number;
  onTryOn?: (outfit: Outfit) => void;
}

export function AIOutfitRecommendations({ 
  title = "AI-Curated Just for You",
  subtitle = "Based on your style preferences",
  maxItems = 4,
  onTryOn
}: AIOutfitRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Outfit[]>([]);
  const [preferences, setPreferences] = useState<StylePreference | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user preferences and generate recommendations
    const userPreferences = getUserPreferences();
    setPreferences(userPreferences);
    
    // Simulate API delay
    setLoading(true);
    setTimeout(() => {
      const aiRecommendations = getAIRecommendations(outfitsData, userPreferences);
      setRecommendations(aiRecommendations.slice(0, maxItems));
      setLoading(false);
    }, 1000);
  }, [maxItems]);

  // Regenerate recommendations with current preferences
  const regenerateRecommendations = () => {
    if (!preferences) return;
    
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const aiRecommendations = getAIRecommendations(outfitsData, preferences);
      setRecommendations(aiRecommendations.slice(0, maxItems));
      setLoading(false);
    }, 1000);
  };

  // Handle trying on an outfit
  const handleTryOn = (outfit: Outfit) => {
    if (onTryOn) {
      onTryOn(outfit);
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          <Heading level={3} className="font-semibold">{title}</Heading>
          <Text className="text-text-secondary">{subtitle}</Text>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={regenerateRecommendations}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(maxItems)].map((_, index) => (
            <Card key={index} className="overflow-hidden animate-pulse">
              <div className="aspect-[2/3] bg-gray-200"></div>
              <div className="p-3 space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-100 rounded mt-2"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {recommendations.length > 0 ? (
            recommendations.map((outfit) => (
              <Card key={outfit.id} className="overflow-hidden">
                <div className="aspect-[2/3] relative">
                  <Image 
                    src={outfit.image} 
                    alt={outfit.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover"
                    priority
                    onError={(e) => {
                      // Fallback to a placeholder on error
                      const target = e.target as HTMLImageElement;
                      target.src = "https://via.placeholder.com/300x450?text=Image+Not+Found";
                    }}
                  />
                  <div className="absolute top-2 right-2 bg-primary-main text-white text-xs rounded-full px-2 py-1">
                    AI Pick
                  </div>
                </div>
                <div className="p-3">
                  <Heading level={5} className="mb-1">{outfit.title}</Heading>
                  <div className="flex items-center text-text-secondary text-xs mb-1">
                    <span className="mr-2">{outfit.category}</span>
                    <span>•</span>
                    <span className="ml-2">{outfit.brand}</span>
                  </div>
                  <Text className="text-text-secondary text-sm line-clamp-2">{outfit.description}</Text>
                  <div className="mt-2 flex justify-between items-center">
                    <Button 
                      size="sm" 
                      variant="primary"
                      onClick={() => handleTryOn(outfit)}
                    >
                      Try On
                    </Button>
                    <button className="p-1 rounded-full hover:bg-gray-100">
                      <Heart className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-full p-8 text-center bg-gray-50 rounded-lg">
              <Text className="text-text-secondary">
                No recommendations available. Try updating your style preferences.
              </Text>
            </div>
          )}
        </div>
      )}
      
      {/* If there are no preferences set, show a message */}
      {preferences && Object.values(preferences).every(pref => pref.length === 0) && (
        <div className="mt-4 p-4 bg-primary-light/30 rounded-lg">
          <Text className="text-text-secondary text-center">
            Set your style preferences to get personalized AI recommendations!
          </Text>
        </div>
      )}
    </div>
  );
} 