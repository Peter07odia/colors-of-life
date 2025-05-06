'use client';

import React from 'react';
import { Heading, Text } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';

export default function AIStylistPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Heading level={1} className="mb-6">
        AI Stylist
      </Heading>
      <Text variant="large" className="mb-8">
        Get personalized style recommendations from our AI stylist.
      </Text>
      <div className="grid gap-6">
        <Button size="lg">Start Consultation</Button>
      </div>
    </div>
  );
} 