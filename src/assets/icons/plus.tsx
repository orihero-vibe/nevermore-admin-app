import React from 'react';
import { Svg, Path } from 'react-native-svg';

interface PlusIconProps {
  width?: number;
  height?: number;
  color?: string;
}

export default function PlusIcon({ 
  width = 24, 
  height = 24, 
  color = '#8B5CF6' 
}: PlusIconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 5V19"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M5 12H19"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
