'use client';

import React from 'react';
import { Heading } from '../../components/ui/Typography';
import { RedesignedVirtualTryOn } from '../../components/tryOn/RedesignedVirtualTryOn';

export default function TryOnPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Heading level={1} className="mb-6">
        Virtual Try-On
      </Heading>
      <RedesignedVirtualTryOn />
    </div>
  );
} 