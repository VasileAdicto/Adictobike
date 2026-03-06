import React from 'react';
import { Component } from '../types';

interface VisualizerProps {
  selectedComponents: Component[];
}

export const Visualizer: React.FC<VisualizerProps> = ({ selectedComponents }) => {
  // Sort components by zIndex to ensure correct layering
  const sortedComponents = [...selectedComponents].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div className="relative w-full aspect-video bg-zinc-900 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10" 
           style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      
      {/* Layered Images */}
      <div className="relative w-full h-full flex items-center justify-center">
        {sortedComponents.length === 0 ? (
          <div className="text-zinc-500 font-mono text-sm uppercase tracking-widest animate-pulse">
            Waiting for frame selection...
          </div>
        ) : (
          sortedComponents.map((comp) => (
            <img
              key={comp.id}
              src={comp.imageUrl}
              alt={comp.name}
              className="absolute inset-0 w-full h-full object-contain transition-opacity duration-500"
              style={{ zIndex: comp.zIndex }}
              referrerPolicy="no-referrer"
            />
          ))
        )}
      </div>

      {/* Overlay Stats */}
      <div className="absolute bottom-6 left-6 flex gap-4">
        <div className="bg-black/80 backdrop-blur-md border border-white/10 px-4 py-2 rounded-lg">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Total Weight</p>
          <p className="text-white font-mono text-lg">
            {(selectedComponents.reduce((acc, c) => acc + c.weight, 0) / 1000).toFixed(2)} kg
          </p>
        </div>
        <div className="bg-black/80 backdrop-blur-md border border-red-500/20 px-4 py-2 rounded-lg">
          <p className="text-[10px] text-red-500 uppercase tracking-wider font-mono">Total Price</p>
          <p className="text-white font-mono text-lg">
            €{selectedComponents.reduce((acc, c) => acc + c.price, 0).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};
