'use client';

import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface PageLoaderProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Consistent full-page loading screen
 * Use this for page-level loading states to maintain consistency
 */
export const PageLoader: React.FC<PageLoaderProps> = ({ 
  text = 'Loading...', 
  size = 'xl' 
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size={size} />
        {text && (
          <p className="mt-4 text-gray-600 text-lg font-medium">{text}</p>
        )}
      </div>
    </div>
  );
};
