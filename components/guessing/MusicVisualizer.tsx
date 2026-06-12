import useDynamicHeights from '@/hooks/useDynamicHeights';
import { motion } from 'motion/react';

export default function MusicVisualizer() {
  const time = 300;
  const minHeight = 40;
  const maxHeight = 400;
  const heights = useDynamicHeights(22, time, minHeight, maxHeight);

  return (
    <div
      className={`flex items-end justify-center gap-7 h-48`}
      style={{ transform: `translateY(-${maxHeight / 4}px)` }}
    >
      {heights.map((height, index) => (
        <motion.div
          key={index}
          className="w-7 bg-white rounded-full border-2 border-gray-200"
          animate={{ height: `${height}px`, y: height / 2 }}
          transition={{ type: 'tween', duration: time / 1000, ease: 'linear' }}
        />
      ))}
    </div>
  );
}
