import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TryOnContextType {
  hasClothesForTryOn: boolean;
  selectedClothesCount: number;
  isProcessing: boolean;
  setHasClothesForTryOn: (hasClothes: boolean) => void;
  setSelectedClothesCount: (count: number) => void;
  setIsProcessing: (processing: boolean) => void;
}

const TryOnContext = createContext<TryOnContextType | undefined>(undefined);

interface TryOnProviderProps {
  children: ReactNode;
}

export function TryOnProvider({ children }: TryOnProviderProps) {
  const [hasClothesForTryOn, setHasClothesForTryOn] = useState(false);
  const [selectedClothesCount, setSelectedClothesCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const value: TryOnContextType = {
    hasClothesForTryOn,
    selectedClothesCount,
    isProcessing,
    setHasClothesForTryOn,
    setSelectedClothesCount,
    setIsProcessing,
  };

  return (
    <TryOnContext.Provider value={value}>
      {children}
    </TryOnContext.Provider>
  );
}

export function useTryOnContext(): TryOnContextType {
  const context = useContext(TryOnContext);
  if (context === undefined) {
    throw new Error('useTryOnContext must be used within a TryOnProvider');
  }
  return context;
} 