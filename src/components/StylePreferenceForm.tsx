import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Heading, Text } from './ui/Typography';
import { StylePreference, getUserPreferences, saveUserPreferences } from '../lib/userPreferences';
import { styleOptions } from '../lib/outfitData';

interface StylePreferenceFormProps {
  onPreferencesChanged?: (preferences: StylePreference) => void;
  showTitle?: boolean;
}

export function StylePreferenceForm({ onPreferencesChanged, showTitle = true }: StylePreferenceFormProps) {
  const [preferences, setPreferences] = useState<StylePreference>({
    categories: [],
    colors: [],
    patterns: [],
    occasions: [],
    brands: [],
    fit: []
  });
  
  const [activeSection, setActiveSection] = useState<keyof StylePreference>('categories');

  // Load saved preferences on component mount
  useEffect(() => {
    const savedPreferences = getUserPreferences();
    setPreferences(savedPreferences);
  }, []);

  // Handle checkbox change for multi-select options
  const handlePreferenceChange = (
    section: keyof StylePreference,
    value: string,
    isChecked: boolean
  ) => {
    const updatedPreferences = { ...preferences };
    
    if (isChecked) {
      updatedPreferences[section] = [...updatedPreferences[section], value];
    } else {
      updatedPreferences[section] = updatedPreferences[section].filter(item => item !== value);
    }
    
    setPreferences(updatedPreferences);
    
    // Save preferences and notify parent if callback exists
    saveUserPreferences(updatedPreferences);
    if (onPreferencesChanged) {
      onPreferencesChanged(updatedPreferences);
    }
  };

  // Sections for the form
  const sections: { key: keyof StylePreference; title: string }[] = [
    { key: 'categories', title: 'Style Categories' },
    { key: 'colors', title: 'Preferred Colors' },
    { key: 'occasions', title: 'Occasions' },
    { key: 'patterns', title: 'Patterns' },
    { key: 'fit', title: 'Fit Style' },
    { key: 'brands', title: 'Brands' }
  ];

  return (
    <Card className="p-4">
      {showTitle && (
        <div className="mb-4">
          <Heading level={3} className="mb-2">Style Preferences</Heading>
          <Text className="text-text-secondary">Tell us what you like and we'll recommend outfits for you</Text>
        </div>
      )}
      
      {/* Section Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {sections.map(section => (
          <button
            key={section.key}
            className={`px-3 py-1 rounded-full text-sm ${
              activeSection === section.key
                ? 'bg-primary-main text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
            onClick={() => setActiveSection(section.key)}
          >
            {section.title}
          </button>
        ))}
      </div>
      
      {/* Option Selection */}
      <div className="mb-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {styleOptions[activeSection].map(option => (
            <label
              key={option}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={preferences[activeSection].includes(option)}
                onChange={(e) => handlePreferenceChange(
                  activeSection,
                  option,
                  e.target.checked
                )}
                className="w-4 h-4 accent-primary-main"
              />
              <span className="text-sm">{option}</span>
            </label>
          ))}
        </div>
      </div>
      
      {/* Selected Preferences Summary */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <Text className="font-medium mb-2">Your Selected Preferences</Text>
        <div className="space-y-2">
          {sections.map(section => (
            <div key={section.key} className="text-sm">
              <span className="font-medium">{section.title}: </span>
              {preferences[section.key].length > 0 ? (
                <span className="text-text-secondary">
                  {preferences[section.key].join(', ')}
                </span>
              ) : (
                <span className="text-text-secondary italic">No preferences set</span>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-4 flex justify-end">
        <Button 
          variant="primary" 
          onClick={() => {
            saveUserPreferences(preferences);
            if (onPreferencesChanged) {
              onPreferencesChanged(preferences);
            }
          }}
        >
          Save Preferences
        </Button>
      </div>
    </Card>
  );
} 