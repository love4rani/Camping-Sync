import React from 'react';

export const Icon = ({ name, fill = false, size = 'text-2xl', className = '' }: { 
  name: string; 
  fill?: boolean; 
  size?: string; 
  className?: string;
}) => (
  <span
    className={`material-symbols-outlined ${size} select-none ${className}`}
    style={fill ? { fontVariationSettings: "'FILL' 1" } : {}}
  >
    {name}
  </span>
);

export default Icon;
