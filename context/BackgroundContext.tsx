'use client';
import { createContext, useContext, useState } from 'react';
import type { ShaderColors } from '@/components/CanvasBackground';

const DEFAULT_COLORS: ShaderColors = [
  [299, 186, 137], // amberYellow
  [49, 98, 238], // deepBlue
  [246, 146, 146], // pink
  [89, 181, 243], // blue
  [105, 49, 245], // purpleHaze
  [32, 42, 50], // swampyBlack
  [233, 51, 52], // persimmonOrange
  [233, 160, 75], // darkAmber
];

interface BackgroundContextValue {
  colors: ShaderColors;
  setColors: (colors: ShaderColors) => void;
}

const BackgroundContext = createContext<BackgroundContextValue>({
  colors: DEFAULT_COLORS,
  setColors: () => {},
});

export function BackgroundProvider({ children }: { children: React.ReactNode }) {
  const [colors, setColors] = useState<ShaderColors>(DEFAULT_COLORS);
  return (
    <BackgroundContext.Provider value={{ colors, setColors }}>
      {children}
    </BackgroundContext.Provider>
  );
}

export function useBackground() {
  return useContext(BackgroundContext);
}
