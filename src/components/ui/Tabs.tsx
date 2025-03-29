import React from 'react';
import { Tab as HeadlessTab } from '@headlessui/react';
import { cn } from '../../lib/utils';

interface TabsProps {
  tabs: { id: string; label: string }[];
  children: React.ReactNode;
  className?: string;
}

export function Tabs({ tabs, children, className }: TabsProps) {
  return (
    <HeadlessTab.Group>
      <HeadlessTab.List
        className={cn(
          'flex space-x-1 rounded-xl bg-background-off p-1',
          className
        )}
      >
        {tabs.map((tab) => (
          <HeadlessTab
            key={tab.id}
            className={({ selected }) =>
              cn(
                'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                'focus:outline-none focus:ring-2 focus:ring-primary-light',
                selected
                  ? 'bg-white text-primary-main shadow'
                  : 'text-text-secondary hover:bg-white/[0.12] hover:text-text-primary'
              )
            }
          >
            {tab.label}
          </HeadlessTab>
        ))}
      </HeadlessTab.List>
      <HeadlessTab.Panels className="mt-4">
        {children}
      </HeadlessTab.Panels>
    </HeadlessTab.Group>
  );
}

interface TabPanelProps {
  children: React.ReactNode;
  className?: string;
}

export function TabPanel({ children, className }: TabPanelProps) {
  return (
    <HeadlessTab.Panel
      className={cn(
        'rounded-xl bg-white p-3',
        'focus:outline-none focus:ring-2 focus:ring-primary-light focus:ring-offset-2',
        className
      )}
    >
      {children}
    </HeadlessTab.Panel>
  );
} 