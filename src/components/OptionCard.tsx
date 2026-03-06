import React from 'react';
import { Component } from '../types';
import { cn } from '../lib/utils';
import { Check } from 'lucide-react';

interface OptionCardProps {
  component: Component;
  isSelected: boolean;
  onSelect: (component: Component) => void;
}

export const OptionCard: React.FC<OptionCardProps> = ({ component, isSelected, onSelect }) => {
  return (
    <button
      onClick={() => onSelect(component)}
      className={cn(
        "group relative flex flex-col text-left p-4 rounded-xl border transition-all duration-300",
        isSelected 
          ? "bg-white border-red-600 shadow-[0_0_20px_rgba(255,0,0,0.1)]" 
          : "bg-zinc-900 border-white/5 hover:border-white/20"
      )}
    >
      <div className="aspect-square w-full rounded-lg overflow-hidden bg-zinc-800 mb-4">
        <img 
          src={component.imageUrl} 
          alt={component.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
      </div>
      
      <div className="flex-1">
        <p className={cn(
          "text-[10px] uppercase tracking-widest font-mono mb-1",
          isSelected ? "text-red-600" : "text-zinc-500"
        )}>
          {component.brand}
        </p>
        <h3 className={cn(
          "font-medium leading-tight mb-2",
          isSelected ? "text-black" : "text-white"
        )}>
          {component.name}
        </h3>
      </div>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
        <div className="flex flex-col">
          <span className={cn(
            "text-xs font-mono",
            isSelected ? "text-zinc-600" : "text-zinc-400"
          )}>
            {component.weight}g
          </span>
          <span className={cn(
            "text-sm font-bold font-mono",
            isSelected ? "text-black" : "text-white"
          )}>
            €{component.price}
          </span>
        </div>
        
        {isSelected && (
          <div className="bg-red-600 p-1 rounded-full">
            <Check className="w-4 h-4 text-white" />
          </div>
        )}
      </div>
    </button>
  );
};
