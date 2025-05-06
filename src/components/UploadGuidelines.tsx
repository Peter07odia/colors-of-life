import React from 'react';
import Image from 'next/image';
import { CheckCircle, XCircle } from 'lucide-react';

interface UploadGuidelinesProps {
  isVisible: boolean;
}

const UploadGuidelines: React.FC<UploadGuidelinesProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex flex-col items-center justify-center text-white p-4 overflow-auto">
      <div className="max-w-4xl w-full">
        <h2 className="text-xl font-bold mb-4">
          Please follow these guidelines for uploading garment images to achieve the best Try-On results.
        </h2>
        
        <p className="mb-6 text-gray-300">
          Images up to 50MB, with short side &gt;= 512px, long side &lt;= 4096px and formats JPG/PNG.
        </p>
        
        {/* Good examples */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'Clear Solo Photo', image: '/images/guidelines/good-1.jpg' },
            { label: 'Full Body/Half Body Front View', image: '/images/guidelines/good-2.jpg' },
            { label: 'Unobstructed Clothing Area', image: '/images/guidelines/good-3.jpg' },
            { label: 'Simple Pose', image: '/images/guidelines/good-4.jpg' },
            { label: 'Simple Fitting Attire', image: '/images/guidelines/good-5.jpg' },
            { label: 'Face Unobstructed', image: '/images/guidelines/good-6.jpg' },
          ].map((example, index) => (
            <div key={index} className="bg-white rounded-lg overflow-hidden">
              <div className="relative w-full h-48">
                <Image 
                  src={example.image || '/images/avatar-placeholder.png'} 
                  alt={example.label} 
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-80 p-2">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <p className="text-black text-sm">{example.label}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <h3 className="text-lg font-bold mb-4">
          Avoid the bad examples, as they may reduce the quality of the Try-On results.
        </h3>
        
        {/* Bad examples */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'Group Photo', image: '/images/guidelines/bad-1.jpg' },
            { label: 'Reclining/Sitting Position', image: '/images/guidelines/bad-2.jpg' },
            { label: 'Obstructed Clothing Area', image: '/images/guidelines/bad-3.jpg' },
            { label: 'Complex Pose', image: '/images/guidelines/bad-4.jpg' },
            { label: 'Bulky Clothing', image: '/images/guidelines/bad-5.jpg' },
            { label: 'Face Obstructed', image: '/images/guidelines/bad-6.jpg' },
          ].map((example, index) => (
            <div key={index} className="bg-white rounded-lg overflow-hidden">
              <div className="relative w-full h-48">
                <Image 
                  src={example.image || '/images/avatar-placeholder.png'} 
                  alt={example.label} 
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-80 p-2">
                  <div className="flex items-center">
                    <XCircle className="h-4 w-4 text-red-500 mr-2" />
                    <p className="text-black text-sm">{example.label}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <button 
          className="bg-white text-black px-6 py-2 rounded-full font-medium mx-auto block"
          onClick={() => window.history.back()}
        >
          Got it
        </button>
      </div>
    </div>
  );
};

export default UploadGuidelines; 