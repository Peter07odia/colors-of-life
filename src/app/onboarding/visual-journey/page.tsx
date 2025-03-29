import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Heading, Text } from '../../../components/ui/Typography';
import { Tabs, TabPanel } from '../../../components/ui/Tabs';

const styleCategories = [
  { id: 'casual', label: 'Casual', images: ['casual1.jpg', 'casual2.jpg', 'casual3.jpg', 'casual4.jpg'] },
  { id: 'formal', label: 'Formal', images: ['formal1.jpg', 'formal2.jpg', 'formal3.jpg', 'formal4.jpg'] },
  { id: 'athleisure', label: 'Athleisure', images: ['athleisure1.jpg', 'athleisure2.jpg', 'athleisure3.jpg', 'athleisure4.jpg'] },
  { id: 'bohemian', label: 'Bohemian', images: ['bohemian1.jpg', 'bohemian2.jpg', 'bohemian3.jpg', 'bohemian4.jpg'] },
];

export default function VisualJourney() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center text-text-secondary hover:text-text-primary">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Link>
      </div>
      
      <div className="mb-8">
        <Heading level={2} className="mb-2">
          Let's Discover Your Style
        </Heading>
        <Text>
          Select the styles that resonate with you to help us understand your preferences.
        </Text>
      </div>
      
      <Tabs tabs={styleCategories.map(cat => ({ id: cat.id, label: cat.label }))}>
        {styleCategories.map((category) => (
          <TabPanel key={category.id}>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {category.images.map((image, index) => (
                <Card 
                  key={index}
                  className="relative cursor-pointer overflow-hidden p-0 transition-all hover:ring-2 hover:ring-primary-main"
                >
                  <div className="aspect-square bg-gray-200" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity hover:bg-black/20 hover:opacity-100">
                    <Button variant="primary" size="sm">
                      Select
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabPanel>
        ))}
      </Tabs>
      
      <div className="mt-8 flex justify-between">
        <Button variant="outline">
          Skip
        </Button>
        <Button>
          Next <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
} 