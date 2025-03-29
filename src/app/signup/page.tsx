import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import { Heading, Text } from '../../components/ui/Typography';

export default function SignUp() {
  return (
    <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-text-secondary hover:text-text-primary">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Link>
        </div>
        
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Create an Account</CardTitle>
            <Text variant="muted">Join Colors of Life and discover your perfect style</Text>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              required
            />
            
            <Input
              label="Email Address"
              type="email"
              placeholder="Enter your email address"
              required
            />
            
            <Input
              label="Password"
              type="password"
              placeholder="Create a password"
              required
            />
            
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="terms" 
                className="h-4 w-4 rounded border-gray-300 text-primary-main focus:ring-primary-light"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-text-secondary">
                I agree to the <Link href="/terms" className="text-primary-main hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-primary-main hover:underline">Privacy Policy</Link>
              </label>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button className="w-full">
              Create Account
            </Button>
            
            <Text variant="muted" className="text-center">
              Already have an account? <Link href="/login" className="text-primary-main hover:underline">Sign in</Link>
            </Text>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 