'use client';

import React from 'react';
import { Heading, Text } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';

export default function CartPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Heading level={1} className="mb-6">
        Your Cart
      </Heading>
      <Text variant="large" className="mb-8">
        Review your items before checkout.
      </Text>
      <div className="grid gap-6">
        {/* Empty cart state */}
        <div className="text-center py-12">
          <Text>Your cart is empty</Text>
          <div className="mt-6">
            <Button size="lg">Continue Shopping</Button>
          </div>
        </div>
      </div>
    </div>
  );
} 