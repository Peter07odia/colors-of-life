'use client';

import { useState, useEffect } from 'react';
import { resetAppState, checkAppHealth } from '../utils/healthCheck';

export default function AppReset() {
  const [showOptions, setShowOptions] = useState(false);
  const [healthStatus, setHealthStatus] = useState(null);

  const handleDiagnose = async () => {
    const status = await checkAppHealth();
    setHealthStatus(status);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset the app? This will clear all local data.')) {
      resetAppState();
    }
  };

  // Hidden by default, only visible with keyboard shortcut Ctrl+Shift+R
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'R') {
      e.preventDefault();
      setShowOptions(!showOptions);
    }
  };

  // Add event listener on mount, remove on unmount
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!showOptions) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 z-50 w-80">
      <h3 className="text-lg font-semibold mb-2">App Troubleshooter</h3>
      
      <div className="space-y-2">
        <button 
          onClick={handleDiagnose}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
        >
          Diagnose Issues
        </button>

        <button 
          onClick={handleReset}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
        >
          Reset App
        </button>
      </div>

      {healthStatus && (
        <div className="mt-4 text-sm">
          <p className={`font-bold ${healthStatus.healthy ? 'text-green-500' : 'text-red-500'}`}>
            Status: {healthStatus.healthy ? 'Healthy' : 'Issues Detected'}
          </p>
          {healthStatus.issues.length > 0 && (
            <ul className="mt-2 list-disc pl-5">
              {healthStatus.issues.map((issue, i) => (
                <li key={i} className="text-red-500">{issue}</li>
              ))}
            </ul>
          )}
          <p className="text-xs mt-2 text-gray-500">
            Last checked: {new Date(healthStatus.timestamp).toLocaleString()}
          </p>
        </div>
      )}
      
      <button 
        onClick={() => setShowOptions(false)}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
      >
        ✕
      </button>
    </div>
  );
} 