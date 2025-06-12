import React from 'react';
import { Grid3X3, List } from 'lucide-react';

interface ViewToggleProps {
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
}

export default function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => onViewChange('grid')}
        className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-all ${
          view === 'grid'
            ? 'bg-white text-emerald-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <Grid3X3 className="w-4 h-4" />
        <span className="text-sm font-medium">Tarjetas</span>
      </button>
      <button
        onClick={() => onViewChange('list')}
        className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-all ${
          view === 'list'
            ? 'bg-white text-emerald-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <List className="w-4 h-4" />
        <span className="text-sm font-medium">Lista</span>
      </button>
    </div>
  );
}
