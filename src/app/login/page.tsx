'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import { Text } from '../../components/ui/Typography';

export default function Login() {
  const router = useRouter();
  const [formState, setFormState] = React.useState({
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      // Set a mock authentication cookie
      document.cookie = 'authenticated=true; path=/';
      
      // Store user data in localStorage (for simulating authentication)
      localStorage.setItem('user', JSON.stringify({
        email: formState.email,
        authenticated: true
      }));
      
      // Redirect to the feed page after successful login
      router.push('/style-feed');
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
              <CardTitle>Welcome Back</CardTitle>
              <Text variant="muted">Sign in to your Colors of Life account</Text>
            </CardHeader>
            
            <CardContent className="space-y-4">
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
                placeholder="Enter your password"
                required
                value={formState.password}
                onChange={handleInputChange}
              />
              
              <div className="flex justify-end">
                <Link href="/forgot-password" className="text-sm text-primary-main hover:underline">
                  Forgot password?
                </Link>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full"
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                Sign In
              </Button>
              
              <Text variant="muted" className="text-center">
                Don't have an account? <Link href="/signup" className="text-primary-main hover:underline">Create one</Link>
              </Text>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
} 