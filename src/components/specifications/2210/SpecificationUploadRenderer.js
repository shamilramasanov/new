import React from 'react';
import { RendererProps } from '../common/types';

export default function SpecificationUploadRenderer({ loading }) {
  if (!loading) return null;

  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-full"></div>
      <div className="space-y-3">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="grid grid-cols-5 gap-4">
            <div className="h-4 bg-gray-200 rounded col-span-2"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
