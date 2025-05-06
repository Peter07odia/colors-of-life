'use client';

import React, { useState } from 'react';
import { AIOutfitRecommendations } from '../../components/AIOutfitRecommendations';
import { StylePreferenceForm } from '../../components/StylePreferenceForm';
import { RedesignedVirtualTryOn } from '../../components/tryOn/RedesignedVirtualTryOn';
import { Heading, Text } from '../../components/ui/Typography';
import { 
  ShoppingBag, 
  Settings, 
  Shirt, 
  ChevronLeft,
  ChevronRight,
  Home,
  ShoppingCart,
  Menu,
  UserCircle2
} from 'lucide-react';
import { useUIStore } from '../../lib/store/uiStore';

// Custom AiStylistIcon for the AI Stylist section
const AiStylistIcon = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2a9 9 0 0 1 9 9c0 3.86-3.14 7-7 7h-4c-1.9 0-3.5-1.1-4.31-2.8" />
      <path d="M5 16a5 5 0 1 1 0-10" />
      <path d="M15 11h-3a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h2a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1h-3" />
      <path d="M12 19v4" />
    </svg>
  );
};

export default function Dashboard() {
  const [selectedTab, setSelectedTab] = useState('style-feed');
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Define all the tabs for the main navigation
  const tabItems = [
    { 
      id: 'style-feed', 
      label: 'For You', 
      icon: <Home className="w-5 h-5" />,
      description: 'Explore trending styles'
    },
    { 
      id: 'tryon', 
      label: 'Try On', 
      icon: <Shirt className="w-5 h-5" />,
      description: 'Try clothes virtually'
    },
    { 
      id: 'ai-stylist', 
      label: 'AI Stylist', 
      icon: <UserCircle2 className="w-5 h-5" />,
      description: 'Get personalized fashion advice'
    },
    { 
      id: 'cart', 
      label: 'Cart', 
      icon: <ShoppingCart className="w-5 h-5" />,
      description: 'View your shopping cart'
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: <Settings className="w-5 h-5" />,
      description: 'Manage your preferences'
    },
  ];

  const renderContent = () => {
    switch (selectedTab) {
      case 'style-feed':
        return (
          <div className="h-[calc(100vh-64px)] overflow-hidden bg-black">
            <iframe 
              src="/style-feed" 
              className="w-full h-full border-none"
              title="Style Feed"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              loading="eager"
              scrolling="yes"
            />
          </div>
        );
      case 'ai-stylist':
        return (
          <div className="p-6">
            <div className="mb-6">
              <Heading level={2} className="mb-2">Your AI Stylist</Heading>
              <Text className="text-text-secondary">Get personalized fashion advice and recommendations</Text>
            </div>
            <AIOutfitRecommendations 
              title="AI-Curated Just for You"
              subtitle="Based on your style preferences"
              onTryOn={(outfit) => {
                setSelectedTab('tryon');
              }}
            />
          </div>
        );
      case 'tryon':
        return (
          <div className="p-6">
            <div className="mb-6">
              <Heading level={2} className="mb-2">Virtual Try-On</Heading>
              <Text className="text-text-secondary">Try on outfits virtually before you buy</Text>
            </div>
            <RedesignedVirtualTryOn />
          </div>
        );
      case 'cart':
        return (
          <div className="p-6">
            <div className="mb-6">
              <Heading level={2} className="mb-2">Shopping Cart</Heading>
              <Text className="text-text-secondary">Items you've added to purchase</Text>
            </div>
            <div className="flex items-center justify-center h-[50vh] bg-gray-100 rounded-lg">
              <Text className="text-text-secondary">Your cart is empty</Text>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="p-6">
            <div className="mb-6">
              <Heading level={2} className="mb-2">Settings</Heading>
              <Text className="text-text-secondary">Manage your account and preferences</Text>
            </div>
            <div className="space-y-6">
              {/* Profile Section */}
              <div>
                <Heading level={3} className="mb-4">Profile</Heading>
                <StylePreferenceForm showTitle={false} />
              </div>
              
              {/* Settings Section */}
              <div>
                <Heading level={3} className="mb-4">App Settings</Heading>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                    <div>
                      <Text className="font-medium">Dark Mode</Text>
                      <Text className="text-sm text-text-secondary">Switch between light and dark theme</Text>
                    </div>
                    <button 
                      onClick={() => {
                        const uiStore = useUIStore.getState();
                        uiStore.toggleDarkMode();
                      }}
                      className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200"
                    >
                      <span className="sr-only">Toggle dark mode</span>
                      <span 
                        className={`${
                          useUIStore.getState().isDarkMode ? 'translate-x-6 bg-primary-main' : 'translate-x-1 bg-white'
                        } inline-block h-4 w-4 transform rounded-full transition`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Sidebar Navigation - Desktop */}
      <nav className={`hidden md:flex bg-white border-r border-gray-200 flex-col transition-all duration-300 ${
        isExpanded ? 'w-64' : 'w-20'
      }`}>
        {/* Logo and Toggle Section */}
        <div className="p-4 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center">
            <div className="w-8 h-8 flex items-center justify-center">
              <img 
                src="/images/logo.png" 
                alt="Colors of Life Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            {isExpanded && (
              <span className="ml-3 font-semibold text-gray-900">Colors of Life</span>
            )}
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isExpanded ? (
              <ChevronLeft className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-500" />
            )}
          </button>
        </div>
        
        {/* Navigation Items */}
        <div className="flex-1 py-4 px-3">
          <div className="space-y-2">
            {tabItems.map((tab) => (
              <button 
                key={tab.id}
                className={`w-full flex items-center px-3 py-3 rounded-lg group transition-colors ${
                  selectedTab === tab.id 
                    ? 'bg-primary-light/30 text-primary-main' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setSelectedTab(tab.id)}
              >
                <div className="flex items-center">
                  {tab.icon}
                  {isExpanded && (
                    <div className="ml-3 text-left">
                      <span className="font-medium block">{tab.label}</span>
                      <span className="text-xs text-gray-500">{tab.description}</span>
                    </div>
                  )}
                </div>
                {!isExpanded && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                    {tab.label}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 bg-white z-10 border-b border-gray-200">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <button className="md:hidden mr-4">
                <Menu className="w-6 h-6 text-gray-600" />
              </button>
              <Heading level={4} className="font-bold text-primary-main">
                {tabItems.find(tab => tab.id === selectedTab)?.label}
              </Heading>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4 z-10">
        <div className="flex justify-between items-center">
          {tabItems.map((tab) => (
            <button
              key={tab.id}
              className={`flex flex-col items-center justify-center p-2 ${
                selectedTab === tab.id ? 'text-primary-main' : 'text-text-secondary'
              }`}
              onClick={() => setSelectedTab(tab.id)}
            >
              {tab.icon}
              <Text className="text-xs mt-1">{tab.label}</Text>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
} 