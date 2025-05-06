'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import { Heading, Text } from '../../components/ui/Typography';

export default function SignUp() {
  const router = useRouter();
  const [formState, setFormState] = React.useState({
    fullName: '',
    email: '',
    password: '',
    agreeToTerms: false,
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      // Navigate to the gender selection page after "successful" signup
      router.push('/onboarding/gender-selection');
    }, 1000);
  };

  return (
    <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-text-secondary hover:text-text-primary">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Link>
        </div>
        
        <Card variant="elevated">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Create an Account</CardTitle>
              <Text variant="muted">Join Colors of Life and discover your perfect style</Text>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <Input
                label="Full Name"
                name="fullName"
                placeholder="Enter your full name"
                required
                value={formState.fullName}
                onChange={handleInputChange}
              />
              
              <Input
                label="Email Address"
                name="email"
                type="email"
                placeholder="Enter your email address"
                required
                value={formState.email}
                onChange={handleInputChange}
              />
              
              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="Create a password"
                required
                value={formState.password}
                onChange={handleInputChange}
              />
              
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="agreeToTerms"
                  name="agreeToTerms"
                  className="h-4 w-4 rounded border-gray-300 text-primary-main focus:ring-primary-light"
                  checked={formState.agreeToTerms}
                  onChange={handleInputChange}
                  required
                />
                <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-text-secondary">
                  I agree to the <Link href="/terms" className="text-primary-main hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-primary-main hover:underline">Privacy Policy</Link>
                </label>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full"
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                Create Account
              </Button>
              
              <Text variant="muted" className="text-center">
                Already have an account? <Link href="/login" className="text-primary-main hover:underline">Sign in</Link>
              </Text>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
} 