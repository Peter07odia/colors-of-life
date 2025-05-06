import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Outfit } from '../lib/outfitData';
import { Button } from './ui/Button';
import { Loader, Upload, Camera, RotateCcw, RefreshCw, Heart, Info, CheckCircle, XCircle } from 'lucide-react';
import { Text } from './ui/Typography';
import UploadGuidelines from './UploadGuidelines';

interface VirtualTryOnProps {
  outfit: Outfit | null;
  onReset: () => void;
}

const VirtualTryOn: React.FC<VirtualTryOnProps> = ({ outfit, onReset }) => {
  const [userImage, setUserImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'shopping' | 'outfits'>('shopping');
  const [showGuidelines, setShowGuidelines] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sample example outfits
  const myOutfits = [
    { id: 1, title: 'Nike Air Force', image: '/images/casual/1.png' },
    { id: 2, title: 'adidas Mexico Hoodie', image: '/images/Professional/1.png' },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size and type
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      
      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        setError('Only JPEG and PNG images are supported');
        return;
      }
      
      setError(null);
      
      // Convert to data URL
      const reader = new FileReader();
      reader.onload = () => {
        setUserImage(reader.result as string);
        setResultImage(null); // Reset previous result
      };
      reader.readAsDataURL(file);
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  const processVirtualTryOn = async () => {
    if (!userImage || !outfit) {
      setError('Both your photo and an outfit are required');
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    
    try {
      // For Kling AI, we need to upload the images to public URLs or use base64 encoding
      // First, let's check if our outfit image is already a URL
      const garmentImageUrl = outfit.image.startsWith('http') 
        ? outfit.image 
        : `${window.location.origin}${outfit.image}`;
      
      // For the user image, we'll convert the data URL to base64
      // This is a simplification; in production, you should upload to a temporary storage
      let userImageUrl = userImage;
      
      // Strip the data URL prefix if present to get just the base64 string
      if (userImage.startsWith('data:image')) {
        userImageUrl = userImage.split(',')[1];
      }
      
      // For testing purposes, log the request details
      console.log('Preparing virtual try-on request:', {
        garmentImageUrl,
        userImageBase64Length: userImageUrl.length, // Don't log the full base64 for privacy
      });
      
      try {
        const response = await fetch('/api/virtual-tryon', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            humanImageUrl: userImageUrl, // This will be processed by our API route
            garmentImageUrl,
          }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          console.error('API response not OK:', response.status, data);
          throw new Error(data.error || 'Failed to process virtual try-on');
        }
        
        console.log('Virtual try-on result:', data);
        
        // Set the result image URL from the response - handle various response formats
        const resultImageUrl = data.resultUrl || // Our unified format
                              data.output?.image || // Common Kling format
                              data.image_url || // Alternative format
                              data.output?.result_url; // Yet another format
                              
        if (!resultImageUrl) {
          console.error('No result image URL found in response:', data);
          throw new Error('Could not find result image in the response');
        }
        
        setResultImage(resultImageUrl);
      } catch (error) {
        console.error('API call failed:', error);
        
        // Fallback: Use a simplified approach for demonstration
        console.log('Using fallback approach for demonstration');
        
        // Simulate a delay to make it feel like processing is happening
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // For demonstration purposes, we'll just use the outfit image as the result
        // In a real implementation, you would need to integrate with a working virtual try-on API
        setResultImage(garmentImageUrl);
        
        // Show a message to the user about the simulation
        setError('Note: Using simulation mode. The Kling AI service is currently unavailable, so we are showing the original garment image for demonstration purposes.');
      }
    } catch (error) {
      console.error('Virtual try-on processing error:', error);
      setError(error instanceof Error ? error.message : 'Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const resetAll = () => {
    setUserImage(null);
    setResultImage(null);
    setError(null);
    onReset();
  };

  return (
    <div className="flex flex-col w-full h-full p-6 bg-white">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center">
          <h1 className="text-3xl font-bold">Virtual Try-On</h1>
          <div className="ml-4 px-3 py-1 bg-purple-600 text-white text-xs font-medium rounded-full">
            Beta
          </div>
        </div>
        <p className="text-gray-600 mt-1">Try on clothes virtually with AI</p>
      </header>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left side with model */}
        <div className="flex-1">
          <div className="mb-4 flex items-center">
            <button 
              onClick={triggerFileInput} 
              className="mr-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
            >
              <Camera className="h-4 w-4 text-gray-700" />
            </button>
            <button className="flex items-center text-gray-700 border rounded-full px-3 py-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Change Model
            </button>
          </div>
          
          <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{height: '600px'}}>
            {userImage ? (
              <img 
                src={userImage} 
                alt="Your photo" 
                className="w-full h-full object-contain"
              />
            ) : resultImage ? (
              <img 
                src={resultImage} 
                alt="Try-on result" 
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-gray-400">Default Model</div>
              </div>
            )}
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/jpeg,image/png"
              className="hidden"
            />
          </div>
        </div>
        
        {/* Right side with tabs */}
        <div className="w-full md:w-64">
          {/* Tabs */}
          <div className="flex border-b mb-4">
            <button 
              className={`flex-1 py-2 px-2 text-center ${activeTab === 'shopping' ? 'border-b-2 border-purple-600 text-purple-600 font-medium' : 'text-gray-500'}`}
              onClick={() => setActiveTab('shopping')}
            >
              Shopping List
            </button>
            <button 
              className={`flex-1 py-2 px-2 text-center ${activeTab === 'outfits' ? 'border-b-2 border-purple-600 text-purple-600 font-medium' : 'text-gray-500'}`}
              onClick={() => setActiveTab('outfits')}
            >
              My Outfits
            </button>
          </div>
          
          {/* Content */}
          <div className="space-y-4">
            {myOutfits.map(item => (
              <div key={item.id} className="border rounded-lg overflow-hidden hover:shadow-sm cursor-pointer">
                <div className="flex justify-center p-3 bg-gray-50">
                  <div className="relative h-20 w-32">
                    <div className="bg-gray-200 w-full h-full flex items-center justify-center">
                      {item.title.charAt(0)}
                    </div>
                  </div>
                </div>
                <div className="p-3 text-center">
                  <p className="text-gray-800 text-sm font-medium">{item.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {error && (
        <div className="p-3 mt-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          <div className="font-medium mb-1">Error:</div>
          <div className="text-sm">{error}</div>
        </div>
      )}
      
      {/* Guidelines modal */}
      <UploadGuidelines isVisible={showGuidelines} />
      
      {/* Result modal - will display when resultImage is available */}
      {resultImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-bold">Virtual Try-On Result</h3>
              <button 
                onClick={() => setResultImage(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-6 flex justify-center">
              <img 
                src={resultImage} 
                alt="Try-on result" 
                className="max-h-[70vh] max-w-full object-contain"
              />
            </div>
            <div className="p-4 border-t flex justify-end">
              <Button 
                onClick={() => setResultImage(null)}
                className="mr-2"
                variant="outline"
              >
                Close
              </Button>
              <Button 
                onClick={() => {}}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Save to Wardrobe
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VirtualTryOn; 