import React from 'react';
import Link from 'next/link';
import { Button } from '../components/ui/Button';
import { Heading, Text } from '../components/ui/Typography';
import { motion } from 'framer-motion';

export default function SplashScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8"
      >
        <div className="flex justify-center">
          <div className="h-24 w-24 rounded-full bg-primary-light p-4">
            <div className="h-full w-full rounded-full bg-primary-main" />
          </div>
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        className="mb-8 max-w-md"
      >
        <Heading level={1} className="mb-4">
          Colors of Life
        </Heading>
        <Text variant="large" className="mb-6">
          Discover your perfect style with AI-powered fashion recommendations tailored to your unique preferences.
        </Text>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
        className="space-y-4 w-full max-w-xs"
      >
        <Link href="/signup" className="block w-full">
          <Button size="lg" className="w-full">
            Get Started
          </Button>
        </Link>
        <Link href="/login" className="block w-full">
          <Button variant="outline" size="lg" className="w-full">
            Sign In
          </Button>
        </Link>
      </motion.div>
    </div>
  );
} 