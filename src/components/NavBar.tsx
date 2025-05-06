'use client';

import Link from 'next/link';
import Search from './Search';
import { Home, TShirt, Bell, Settings } from 'lucide-react';
import { useState } from 'react';

export default function NavBar() {
  const [notificationCount] = useState(3);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  return (
    <nav className="bg-white fixed left-0 top-0 h-screen w-16 z-50 flex flex-col border-r border-gray-200">
      <div className="flex flex-col h-full py-4">
        {/* Logo */}
        <Link 
          href="/style-feed" 
          className="flex justify-center mb-8"
        >
          <div className="w-8 h-8 flex items-center justify-center">
            <img 
              src="/images/logo.svg" 
              alt="Colors of Life Logo" 
              className="w-full h-full object-contain"
            />
          </div>
        </Link>
        
        {/* Menu Items */}
        <div className="flex flex-col items-center space-y-4">
          <Link 
            href="/style-feed" 
            className="p-2 rounded-lg hover:bg-gray-100 group transition-colors"
            title="Style Feed"
          >
            <TShirt className="w-5 h-5 text-gray-700 group-hover:text-primary-main" />
          </Link>
          <Link 
            href="/dashboard" 
            className="p-2 rounded-lg hover:bg-gray-100 group transition-colors"
            title="Dashboard"
          >
            <Home className="w-5 h-5 text-gray-700 group-hover:text-primary-main" />
          </Link>
        </div>

        {/* Bottom Section */}
        <div className="mt-auto flex flex-col items-center space-y-4">
          {/* Notifications */}
          <button 
            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5 text-gray-700" />
            {notificationCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </button>

          {/* Settings */}
          <Link 
            href="/settings"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Settings"
          >
            <Settings className="w-5 h-5 text-gray-700" />
          </Link>
        </div>
      </div>
    </nav>
  );
} 