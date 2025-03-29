import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import { Text } from '../../components/ui/Typography';

export default function Login() {
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
            <CardTitle>Welcome Back</CardTitle>
            <Text variant="muted">Sign in to your Colors of Life account</Text>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="Enter your email address"
              required
            />
            
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              required
            />
            
            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-sm text-primary-main hover:underline">
                Forgot password?
              </Link>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button className="w-full">
              Sign In
            </Button>
            
            <Text variant="muted" className="text-center">
              Don't have an account? <Link href="/signup" className="text-primary-main hover:underline">Create one</Link>
            </Text>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 