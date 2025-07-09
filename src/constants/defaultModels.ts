export interface DefaultModel {
  id: string;
  name: string;
  bodyType: string;
  localPath: string;
  description: string;
  avatar_type: 'generic';
  quality_score: number;
}

export const DEFAULT_MODELS: DefaultModel[] = [
  {
    id: 'default-petite',
    name: 'Petite Model',
    bodyType: 'petite',
    localPath: require('../../assets/default models/petite.png'),
    description: 'Perfect for petite body types and smaller clothing sizes',
    avatar_type: 'generic',
    quality_score: 95
  },
  {
    id: 'default-average', 
    name: 'Average Model',
    bodyType: 'average',
    localPath: require('../../assets/default models/average.png'),
    description: 'Ideal for standard body types and regular sizing',
    avatar_type: 'generic',
    quality_score: 95
  },
  {
    id: 'default-athletic',
    name: 'Athletic Model',
    bodyType: 'athletic', 
    localPath: require('../../assets/default models/athletic.png'),
    description: 'Great for athletic builds and activewear',
    avatar_type: 'generic',
    quality_score: 95
  },
  {
    id: 'default-curvy',
    name: 'Curvy Model',
    bodyType: 'curvy',
    localPath: require('../../assets/default models/curvy.png'),
    description: 'Perfect for curvy body types and plus-size fashion',
    avatar_type: 'generic',
    quality_score: 95
  },
  {
    id: 'default-medium-large',
    name: 'Medium-Large Model', 
    bodyType: 'medium-large',
    localPath: require('../../assets/default models/medium-large.png'),
    description: 'Ideal for medium to large body types',
    avatar_type: 'generic',
    quality_score: 95
  },
  {
    id: 'default-xl',
    name: 'XL Model',
    bodyType: 'xl',
    localPath: require('../../assets/default models/xl.png'),
    description: 'Perfect for extra-large sizes and extended fit clothing',
    avatar_type: 'generic',
    quality_score: 95
  }
];

// Body type to model mapping for recommendations
export const BODY_TYPE_TO_MODEL: Record<string, string> = {
  'petite': 'default-petite',
  'small': 'default-petite', 
  'average': 'default-average',
  'medium': 'default-average',
  'athletic': 'default-athletic',
  'fit': 'default-athletic',
  'curvy': 'default-curvy',
  'plus': 'default-curvy',
  'large': 'default-medium-large',
  'xl': 'default-xl',
  'xxl': 'default-xl'
};

// Get recommended model based on user preferences
export const getRecommendedModel = (userPreferences?: {
  bodyType?: string;
  clothingSize?: string;
  height?: string;
}): DefaultModel => {
  if (!userPreferences) {
    return DEFAULT_MODELS[1]; // Default to average
  }

  const { bodyType, clothingSize } = userPreferences;
  
  // Try body type first
  if (bodyType && BODY_TYPE_TO_MODEL[bodyType.toLowerCase()]) {
    const modelId = BODY_TYPE_TO_MODEL[bodyType.toLowerCase()];
    const model = DEFAULT_MODELS.find(m => m.id === modelId);
    if (model) return model;
  }

  // Try clothing size
  if (clothingSize) {
    const size = clothingSize.toLowerCase();
    if (size.includes('xs') || size.includes('petite')) {
      return DEFAULT_MODELS.find(m => m.id === 'default-petite')!;
    }
    if (size.includes('xl') || size.includes('xxl')) {
      return DEFAULT_MODELS.find(m => m.id === 'default-xl')!;
    }
    if (size.includes('l')) {
      return DEFAULT_MODELS.find(m => m.id === 'default-medium-large')!;
    }
  }

  // Default fallback
  return DEFAULT_MODELS[1]; // Average model
}; 