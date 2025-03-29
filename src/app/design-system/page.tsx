import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import { Heading, Text } from '../../components/ui/Typography';
import { Avatar } from '../../components/ui/Avatar';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/Dialog';
import { Tabs, TabPanel } from '../../components/ui/Tabs';

export default function DesignSystem() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center text-text-secondary hover:text-text-primary">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Link>
      </div>
      
      <div className="mb-12">
        <Heading level={1}>Colors of Life Design System</Heading>
        <Text variant="large">A showcase of the UI components used throughout the application</Text>
      </div>
      
      {/* Typography */}
      <section className="mb-12">
        <Heading level={2} className="mb-4">Typography</Heading>
        <div className="space-y-4">
          <Heading level={1}>Heading 1</Heading>
          <Heading level={2}>Heading 2</Heading>
          <Heading level={3}>Heading 3</Heading>
          <Heading level={4}>Heading 4</Heading>
          <Heading level={5}>Heading 5</Heading>
          <Heading level={6}>Heading 6</Heading>
          
          <div className="space-y-2">
            <Text variant="large">Large Text - Used for featured content and introductions</Text>
            <Text variant="body">Body Text - Used for regular paragraphs and content</Text>
            <Text variant="small">Small Text - Used for supplementary information</Text>
            <Text variant="muted">Muted Text - Used for less important information</Text>
          </div>
        </div>
      </section>
      
      {/* Buttons */}
      <section className="mb-12">
        <Heading level={2} className="mb-4">Buttons</Heading>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Button variant="primary" size="lg">Primary Large</Button>
            <Button variant="primary">Primary Medium</Button>
            <Button variant="primary" size="sm">Primary Small</Button>
          </div>
          <div className="space-y-2">
            <Button variant="secondary" size="lg">Secondary Large</Button>
            <Button variant="secondary">Secondary Medium</Button>
            <Button variant="secondary" size="sm">Secondary Small</Button>
          </div>
          <div className="space-y-2">
            <Button variant="outline" size="lg">Outline Large</Button>
            <Button variant="outline">Outline Medium</Button>
            <Button variant="outline" size="sm">Outline Small</Button>
          </div>
          <div className="space-y-2">
            <Button variant="text" size="lg">Text Large</Button>
            <Button variant="text">Text Medium</Button>
            <Button variant="text" size="sm">Text Small</Button>
          </div>
        </div>
      </section>
      
      {/* Form Components */}
      <section className="mb-12">
        <Heading level={2} className="mb-4">Form Components</Heading>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Input label="Standard Input" placeholder="Enter some text" />
          <Input label="Email Input" type="email" placeholder="email@example.com" />
          <Input label="Password Input" type="password" placeholder="Enter your password" />
          <Input label="With Error" placeholder="Enter some text" error="This field is required" />
        </div>
      </section>
      
      {/* Cards */}
      <section className="mb-12">
        <Heading level={2} className="mb-4">Cards</Heading>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card variant="default">
            <CardHeader>
              <CardTitle>Default Card</CardTitle>
            </CardHeader>
            <CardContent>
              <Text>This is a default card with basic styling.</Text>
            </CardContent>
            <CardFooter>
              <Button variant="text" size="sm">Card Action</Button>
            </CardFooter>
          </Card>
          
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Elevated Card</CardTitle>
            </CardHeader>
            <CardContent>
              <Text>This card has elevation with shadow.</Text>
            </CardContent>
            <CardFooter>
              <Button variant="text" size="sm">Card Action</Button>
            </CardFooter>
          </Card>
          
          <Card variant="outline">
            <CardHeader>
              <CardTitle>Outline Card</CardTitle>
            </CardHeader>
            <CardContent>
              <Text>This card has a border outline.</Text>
            </CardContent>
            <CardFooter>
              <Button variant="text" size="sm">Card Action</Button>
            </CardFooter>
          </Card>
        </div>
      </section>
      
      {/* Avatars */}
      <section className="mb-12">
        <Heading level={2} className="mb-4">Avatars</Heading>
        <div className="flex flex-wrap gap-6">
          <Avatar size="sm" initials="SM" />
          <Avatar size="md" initials="MD" />
          <Avatar size="lg" initials="LG" />
          <Avatar size="xl" initials="XL" />
        </div>
      </section>
    </div>
  );
} 