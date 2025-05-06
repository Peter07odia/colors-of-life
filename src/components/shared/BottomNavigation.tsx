'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, ShoppingBag, User, Shirt, Settings } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export default function BottomNavigation() {
  const pathname = usePathname();
  
  const navItems: NavItem[] = [
    {
      label: 'Feed',
      href: '/style-feed',
      icon: <Home className="h-6 w-6" />,
    },
    {
      label: 'Search',
      href: '/search',
      icon: <Search className="h-6 w-6" />,
    },
    {
      label: 'Try On',
      href: '/try-on',
      icon: <Shirt className="h-6 w-6" />,
    },
    {
      label: 'Cart',
      href: '/cart',
      icon: <ShoppingBag className="h-6 w-6" />,
    },
    {
      label: 'Settings',
      href: '/settings',
      icon: <Settings className="h-6 w-6" />,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-2 z-50">
      <nav className="flex justify-between items-center">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex flex-col items-center justify-center w-full py-1 ${
                isActive ? 'text-primary-main' : 'text-gray-500'
              }`}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
} 