'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Outfit, outfitsData } from '../../lib/outfitData';
import { Button } from '../ui/Button';
import { Text } from '../ui/Typography';
import { ShoppingCart, Heart, Camera, Loader as LoaderIcon } from 'lucide-react';

// Define avatar model data with relative paths
const avatarModels = [
  {
    id: 1,
    name: "Casual Wear",
    image: "/models/20250407_1622_Casual_Wear_Selection_remix_01jr8yq707eq99qa4dfpnhgrkk.png"
  },
  {
    id: 2,
    name: "Stylish Simplicity",
    image: "/models/20250408_1616_Stylish_Simplicity_Display_remix_01jrbgr0zrf1887vc81r8rs7ky.png"
  },
  {
    id: 3,
    name: "Elegant Red Dress",
    image: "/models/20250411_0928_Elegant Red Dress_remix_01jrjgf065fxh97t2445q7rxvr.png"
  },
  {
    id: 4,
    name: "Without Coat",
    image: "/models/20250411_0929_Adding Shoes, Removing Coat_remix_01jrjgh9tyf7esf0yzmshm9jsv.png"
  },
  {
    id: 5,
    name: "Gym Shorts",
    image: "/models/20250411_1031_Guy in Gym Shorts_remix_01jrjm3nmbeczbqe221xw845j0.png"
  },
  {
    id: 6,
    name: "Nike Trainers",
    image: "/models/20250411_1450_Model in Nike Trainers_remix_01jrk2y0rpeywraa0gcn59gfqb.png"
  }
];

// Test garments that work well with the try-on feature
const testGarments = [
  {
    id: 101,
    title: "T-shirt (Test)",
    description: "White t-shirt for testing",
    price: "$19.99",
    category: "casual",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 102,
    title: "Blue Shirt (Test)",
    description: "Classic blue button-up shirt",
    price: "$39.99",
    category: "formal",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=776&q=80"
  },
  {
    id: 103,
    title: "Summer Dress (Test)",
    description: "Light summer dress",
    price: "$49.99",
    category: "casual",
    image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80"
  },
  {
    id: 104,
    title: "Leather Jacket (Test)",
    description: "Classic leather jacket",
    price: "$149.99",
    category: "outerwear",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=735&q=80"
  }
];

// Placeholder image for fallback
const PLACEHOLDER_IMAGE = "/images/casual/5 female Casual Fashion.png";

// Saved/favorited wardrobe items
const savedItems = outfitsData.slice(0, 6);

export function RedesignedVirtualTryOn() {
  const [selectedAvatar, setSelectedAvatar] = useState(avatarModels[0]);
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);
  const [selectedTestGarment, setSelectedTestGarment] = useState<any>(testGarments[0]);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hoverItem, setHoverItem] = useState<number | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState<{[key: string]: boolean}>({});
  const [humanImage, setHumanImage] = useState<string | null>(null);
  const [garmentImageUrl, setGarmentImageUrl] = useState<string | null>(null);
  const [useTestGarments, setUseTestGarments] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadFilesRef = useRef<File[]>([]);

  // Effect to initialize image loading status
  useEffect(() => {
    const initialLoadStatus: {[key: string]: boolean} = {};
    avatarModels.forEach(avatar => {
      initialLoadStatus[avatar.image] = false;
    });
    setImagesLoaded(initialLoadStatus);
  }, []);

  // Handle image load
  const handleImageLoad = (path: string) => {
    setImagesLoaded(prev => ({
      ...prev,
      [path]: true
    }));
  };

  // Handle image error
  const handleImageError = (path: string) => {
    console.error(`Failed to load image: ${path}`);
    setError(`Some images failed to load. Using placeholders.`);
  };

  // Handle image upload
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

  // Trigger file input for custom photo upload
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Process virtual try-on
  const processVirtualTryOn = async () => {
    // Use either selected outfit or test garment based on useTestGarments flag
    const outfitToUse = useTestGarments ? selectedTestGarment : selectedOutfit;
    
    if (!outfitToUse) {
      setError('Please select an outfit or test garment to try on');
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    setResultImage(null);
    setStatusMessage('Preparing images...');
    
    try {
      // Get the avatar or user uploaded image
      let modelImageUrl = userImage || selectedAvatar.image;
      
      // For Gemini API, prepare garment image URL
      let garmentImageUrl = outfitToUse.image.startsWith('http') 
        ? outfitToUse.image 
        : `${window.location.origin}${outfitToUse.image}`;
      
      // For the avatar/user image, handle accordingly
      let userImageUrl = modelImageUrl;
      
      // If it's a full URL from our server, keep it as is
      // If it's a local path, add the origin
      if (userImageUrl.startsWith('/') && !userImageUrl.startsWith('data:')) {
        userImageUrl = `${window.location.origin}${userImageUrl}`;
      }
      
      // Ensure both URLs are properly encoded
      if (userImageUrl.includes(' ')) {
        userImageUrl = userImageUrl.replace(/ /g, '%20');
      }
      
      if (garmentImageUrl.includes(' ')) {
        garmentImageUrl = garmentImageUrl.replace(/ /g, '%20');
      }
      
      // Strip the data URL prefix if present to get just the base64 string
      if (typeof userImageUrl === 'string' && userImageUrl.startsWith('data:image')) {
        userImageUrl = userImageUrl.split(',')[1];
      }
      
      console.log('Sending try-on request with:', {
        humanImage: typeof userImageUrl === 'string' && userImageUrl.length > 100 
          ? userImageUrl.substring(0, 50) + '...' 
          : (typeof userImageUrl === 'string' ? userImageUrl : 'Invalid image URL'),
        garmentImage: garmentImageUrl
      });
      
      // Debug info - show this to the user to help troubleshoot
      setStatusMessage('Sending request to AI model...');
      
      try {
        const response = await fetch('/api/virtual-tryon', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            humanImageUrl: userImageUrl,
            garmentImageUrl,
          }),
        });
        
        let data;
        try {
          data = await response.json();
        } catch (jsonError) {
          console.error('Failed to parse API response as JSON:', jsonError);
          throw new Error('Invalid response from server: Could not parse JSON');
        }
        
        if (!response.ok) {
          console.error('API response not OK:', response.status, data);
          
          // Display detailed error information for debugging
          if (data.details) {
            console.error('API detailed errors:', data.details);
          }
          
          let errorMessage = data.error || 'Failed to process virtual try-on';
          
          // Add status code for better error context
          errorMessage = `Error (${response.status}): ${errorMessage}`;
          
          // Add debugging information to help users troubleshoot
          if (response.status === 400 && data.details?.includes('API key not valid')) {
            errorMessage = 'Error: The Gemini API key is invalid. Please configure a valid API key in the server environment.';
          } else if (response.status === 500 && data.details?.includes('Neither text nor image')) {
            errorMessage = 'Error: The AI model did not generate any usable image or text. Try a different model or garment.';
          }
          
          // Include additional error details if available
          if (data.details) {
            // For cleaner UI, only show first part of details if it's very long
            const MAX_DETAILS_LENGTH = 100;
            const detailsText = typeof data.details === 'string' ? data.details : JSON.stringify(data.details);
            const shortDetails = detailsText.length > MAX_DETAILS_LENGTH 
              ? detailsText.substring(0, MAX_DETAILS_LENGTH) + '...' 
              : detailsText;
            
            // Only display details if they add information beyond what's in the main error
            if (!errorMessage.includes(shortDetails)) {
              errorMessage += `\n\nDetails: ${shortDetails}`;
            }
          }
          
          throw new Error(errorMessage);
        }
        
        console.log('Received response from try-on API:', data);
        
        // Handle fallback mode
        if (data.fallback) {
          console.warn('API returned fallback mode:', data.message || 'No specific reason provided');
          
          // Use the fallback image but show an indicator that it's a fallback
          if (data.resultUrl) {
            setResultImage(data.resultUrl);
            setStatusMessage('Using similar style (AI recommendation)');
            setTimeout(() => {
              setStatusMessage(null);
            }, 5000);
            setIsProcessing(false);
            return;
          } else {
            setIsProcessing(false);
            setError(`Error: ${data.error || 'The service was unable to process this try-on request.'}`);
            return;
          }
        }
        
        // Check for specific API configuration errors
        if (data.error && data.error.includes('API key configuration')) {
          setIsProcessing(false);
          setError('Server configuration error: The API key is missing or invalid. Please contact the administrator.');
          return;
        }
        
        // With Gemini API, we get the result immediately - no need for polling
        if (data.resultUrl) {
          console.log('Received result image from Gemini API');
          setStatusMessage('Processing complete!');
          setResultImage(data.resultUrl);
          setIsProcessing(false);
          setTimeout(() => setStatusMessage(''), 2000);
        } else {
          // This shouldn't happen with properly formatted response
          console.error('No result URL in response:', data);
          setIsProcessing(false);
          setError('Error: Response missing result image URL');
        }
      } catch (err: any) {
        console.error('Error during virtual try-on:', err);
        setStatusMessage('');
        setIsProcessing(false);
        
        // Create more user-friendly error message
        let userErrorMessage = 'Failed to process virtual try-on request.';
        
        // Check for specific error conditions
        if (err.message.includes('API key')) {
          userErrorMessage = 'The AI service is not properly configured. Please add a valid Gemini API key in the .env.local file.';
        } else if (err.message.includes('Failed to fetch') || err.message.includes('Network Error')) {
          userErrorMessage = 'Network error: Could not connect to the server. Please check your internet connection.';
        } else if (err.message.includes('timeout')) {
          userErrorMessage = 'The request timed out. The AI generation is taking too long.';
        } else if (err.message.includes('parse')) {
          userErrorMessage = 'The server returned an invalid response. Please try again later.';
        } else if (err.message.includes('Not Found')) {
          userErrorMessage = 'One of the images could not be found. Please try a different model or outfit.';
        } else if (err.message.includes('Neither text nor image')) {
          userErrorMessage = 'The AI model did not generate any usable result. Please try a different model or outfit.';
        } else {
          // Just use the error message as is if it seems user-friendly enough
          userErrorMessage = err.message || userErrorMessage;
        }
        
        setError(`Error: ${userErrorMessage}`);
        
        // Display troubleshooting help for common errors
        if (err.message.includes('API key')) {
          console.info('TROUBLESHOOTING TIP: To fix the API key issue, add your Gemini API key to the .env.local file');
        }
      }
    } catch (error) {
      console.error('Virtual try-on processing error:', error);
      setError(error instanceof Error ? error.message : 'Failed to process image');
      setIsProcessing(false);
    } finally {
      if (!resultImage) {
        // Only clear status message if we're not in async mode
        setTimeout(() => setStatusMessage(null), 3000);
      }
    }
  };
  
  // Function to get user-friendly error message
  const getFriendlyErrorMessage = (error: string, errorCode?: number) => {
    // Check for common error patterns
    if (error.includes('dimension less than 512px') || error.includes('image dimension')) {
      return 'Image size too small. The service requires images of at least 512px width.';
    }
    
    if (error.includes('download image: save image error') || error.includes('download and check image')) {
      return 'Unable to process images. Please try a different model or garment image.';
    }
    
    if (error.includes('upload model image')) {
      return 'There was a problem with the model image. Please try a different model or outfit.';
    }
    
    if (error.includes('payment required') || errorCode === 402) {
      return 'Your PiAPI account has insufficient credits. Please check your account balance.';
    }
    
    if (error.includes('unauthorized') || errorCode === 401 || errorCode === 403) {
      return 'API authorization failed. Please check your API key.';
    }
    
    if (error.includes('API key configuration') || error.includes('API key not valid')) {
      return 'The Gemini API key is not configured. Please add a valid API key in the .env.local file.';
    }
    
    // Return the original error if no patterns match
    return error;
  };
  
  // Clean up on component unmount - removed polling interval cleanup
  useEffect(() => {
    return () => {
      if (uploadFilesRef.current) {
        uploadFilesRef.current.forEach(file => URL.revokeObjectURL(file.preview));
      }
    };
  }, []);

  // Save a look
  const saveLook = () => {
    // In a real implementation, this would save to user's favorites
    alert('Look saved to your favorites!');
  };

  // Shop now action
  const shopNow = () => {
    if (selectedOutfit) {
      alert(`Taking you to shop for: ${selectedOutfit.title}`);
    }
  };

  // Get image source with fallback
  const getImageSrc = (path: string) => {
    return imagesLoaded[path] === false ? PLACEHOLDER_IMAGE : path;
  };

  // Render test garments
  const renderTestGarments = () => {
    return (
      <div className="mt-6">
        <div className="flex flex-col">
          <Text className="font-medium mb-2">Select Test Garment (Reliable Images)</Text>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {testGarments.map((garment) => (
              <div 
                key={garment.id}
                onClick={() => setSelectedTestGarment(garment)}
                className={`${
                  selectedTestGarment?.id === garment.id
                    ? 'border-blue-500 ring-2 ring-blue-300'
                    : 'border-gray-200 hover:border-gray-300'
                } cursor-pointer rounded-lg border-2 p-2 transition-all`}
              >
                <div className="relative h-40 w-full mb-2 overflow-hidden">
                  <img
                    src={garment.image}
                    alt={garment.title}
                    className="object-cover object-center h-full w-full rounded"
                    onLoad={() => handleImageLoad(garment.image)}
                    onError={() => handleImageError(garment.image)}
                  />
                </div>
                <div className="text-sm font-medium">{garment.title}</div>
                <div className="text-xs text-gray-500">{garment.price}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Left side: Models */}
      <div className="w-full md:w-1/4 py-2 pr-2 flex flex-col">
        <Text variant="small" className="font-medium mb-2">Select a Model</Text>
        
        <div className="grid grid-cols-3 gap-2">
          {avatarModels.map((avatar) => (
            <div
              key={avatar.id}
              onClick={() => {
                setSelectedAvatar(avatar);
                setUserImage(null);
                setResultImage(null);
              }}
              onMouseEnter={() => setHoverItem(avatar.id)}
              onMouseLeave={() => setHoverItem(null)}
              className={`
                cursor-pointer rounded-md overflow-hidden border-2 transition-all relative
                ${selectedAvatar.id === avatar.id && !userImage ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-200'}
                ${hoverItem === avatar.id ? 'z-10' : ''}
              `}
            >
              <div className="aspect-square bg-gray-50">
                <div className="relative w-full h-full">
                  <Image
                    src={avatar.image}
                    alt={avatar.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 768px) 50vw, 33vw"
                    onLoad={() => handleImageLoad(avatar.image)}
                    onError={() => handleImageError(avatar.image)}
                    priority={avatar.id <= 2}
                  />
                  {!imagesLoaded[avatar.image] && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                      <LoaderIcon className="w-5 h-5 text-gray-500 animate-spin" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-3 flex justify-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={triggerFileInput}
            className="flex items-center text-xs w-full"
          >
            <Camera className="mr-1 h-3 w-3" />
            Upload Photo
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/jpeg,image/png"
            className="hidden"
          />
        </div>

        {/* Test garments section */}
        {renderTestGarments()}

        {/* Toggle between test garments and regular wardrobe */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <Text variant="small" className="font-medium">Garment Source</Text>
            <div 
              onClick={() => setUseTestGarments(!useTestGarments)}
              className="cursor-pointer relative rounded-full w-12 h-6 bg-gray-200 flex items-center transition-colors duration-300 focus:outline-none"
            >
              <div
                className={`absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full transform transition-transform duration-300 ${
                  useTestGarments ? 'translate-x-6 bg-blue-500' : ''
                }`}
              />
              <span className="sr-only">Use test garments</span>
            </div>
          </div>
          <Text variant="small" className="text-gray-500 text-xs">
            {useTestGarments ? 'Using test garments (recommended)' : 'Using wardrobe items'}
          </Text>
        </div>
      </div>

      {/* Middle: Changing room (model display) */}
      <div className="w-full md:w-2/4 flex flex-col items-center p-2">
        <div className="relative w-full flex-grow max-h-[75vh] overflow-hidden">
          <div className="relative aspect-[2/3] bg-gray-100 rounded-lg overflow-hidden mx-auto h-full">
            {isProcessing ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                <div className="text-center p-4 rounded bg-black bg-opacity-50">
                  <LoaderIcon className="h-8 w-8 text-white animate-spin mx-auto mb-2" />
                  <Text className="text-white text-sm">
                    {statusMessage || 'Processing...'}
                  </Text>
                </div>
              </div>
            ) : null}
            
            {resultImage ? (
              <div className="relative w-full h-full">
                <Image 
                  src={resultImage} 
                  alt="Try-on result" 
                  fill
                  style={{ objectFit: 'contain' }}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            ) : userImage ? (
              <img 
                src={userImage} 
                alt="Your photo" 
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="relative w-full h-full">
                <Image 
                  src={selectedAvatar.image}
                  alt={selectedAvatar.name}
                  fill
                  style={{ objectFit: 'contain' }}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  onLoad={() => handleImageLoad(selectedAvatar.image)}
                  onError={() => handleImageError(selectedAvatar.image)}
                  priority
                />
                {!imagesLoaded[selectedAvatar.image] && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                    <LoaderIcon className="w-10 h-10 text-gray-500 animate-spin" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="w-full mt-4 mb-2">
          {!resultImage && (
            <Button 
              onClick={processVirtualTryOn} 
              isLoading={isProcessing}
              className="w-full"
              disabled={useTestGarments ? !selectedTestGarment : !selectedOutfit}
            >
              Try on this look
            </Button>
          )}
          
          {resultImage && (
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={saveLook} variant="outline" className="flex items-center justify-center">
                <Heart className="mr-2 h-4 w-4" />
                Save Look
              </Button>
              <Button onClick={shopNow} variant="primary" className="flex items-center justify-center">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Shop Now
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Right side: Wardrobe items */}
      <div className={`w-full md:w-1/4 py-2 pl-2 flex flex-col ${useTestGarments ? 'opacity-50' : ''}`}>
        <Text variant="small" className="font-medium mb-2">Your Wardrobe {useTestGarments && '(Disabled)'}</Text>
        
        <div className="grid grid-cols-2 gap-2 overflow-y-auto">
          {savedItems.map((outfit) => (
            <div
              key={outfit.id}
              onClick={() => !useTestGarments && setSelectedOutfit(outfit)}
              onMouseEnter={() => setHoverItem(100 + outfit.id)} // Use offset to differentiate from avatars
              onMouseLeave={() => setHoverItem(null)}
              className={`
                overflow-hidden border-2 transition-all relative rounded-md
                ${useTestGarments ? 'cursor-not-allowed' : 'cursor-pointer'}
                ${selectedOutfit?.id === outfit.id && !useTestGarments ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-200'}
                ${hoverItem === 100 + outfit.id ? 'z-10' : ''}
              `}
            >
              <div className="aspect-square bg-gray-50">
                <div className="relative w-full h-full">
                  <Image
                    src={outfit.image.startsWith('http') ? outfit.image : `${outfit.image}`}
                    alt={outfit.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md mt-4 shadow-lg max-w-md">
          {error}
        </div>
      )}

      {/* Status message */}
      {statusMessage && !error && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-md mt-4 shadow-lg max-w-md">
          {statusMessage}
        </div>
      )}
    </div>
  );
}