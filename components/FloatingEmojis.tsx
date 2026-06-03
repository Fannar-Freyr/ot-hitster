/* eslint-disable react-hooks/purity */
import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

type Emoji = {
  id: number;
  symbol: string;
  x: number;
  y: number;
  drift: number;
  size: number;
  duration: number;
  delay: number;
};

export function EmojiEmitter({
  children,
  emojis = ['🎉', '🔥', '😂'],
}: {
  children: React.ReactNode;
  emojis?: string[];
  spawnRequestListener: (emoji: string) => void;
}) {
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [floating, setFloating] = useState<Emoji[]>([]);

  const spawn = (count = 10) => {
    const trigger = triggerRef.current;
    const container = containerRef.current;
    if (!trigger || !container) return;

    const triggerRect = trigger.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // Calculate position relative to container
    const startX = triggerRect.left - triggerRect.width / 2 - containerRect.left - 10;

    const startY = triggerRect.top - triggerRect.height / 2 - containerRect.top;

    const newEmojis: Emoji[] = Array.from({ length: count }).map(() => ({
      id: Math.random(),
      symbol: emojis[Math.floor(Math.random() * emojis.length)],
      x: startX,
      y: startY,
      drift: (Math.random() - 0.5) * 200,
      size: 20 + Math.random() * 30,
      duration: 2.5 + Math.random(),
      delay: 0,
    }));

    setFloating(prev => [...prev, ...newEmojis]);
  };

  const remove = (id: number) => {
    setFloating(prev => prev.filter(e => e.id !== id));
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {/* Wrapped child */}
      <div ref={triggerRef} onClick={() => spawn(1)} style={{ display: 'inline-block' }}>
        {children}
      </div>

      {/* Floating emojis */}
      {floating.map(e => (
        <motion.span
          key={e.id}
          initial={{
            x: e.x,
            y: e.y,
            opacity: 1,
            scale: 1,
          }}
          animate={{
            x: e.x + e.drift,
            y: e.y - 800,
            opacity: 0,
            scale: 3,
            rotate: 0,
          }}
          transition={{
            duration: e.duration,
            delay: e.delay,
            ease: 'easeOut',
          }}
          onAnimationComplete={() => remove(e.id)}
          style={{
            position: 'absolute',
            fontSize: e.size,
            pointerEvents: 'none',
          }}
        >
          {e.symbol}
        </motion.span>
      ))}
    </div>
  );
}
