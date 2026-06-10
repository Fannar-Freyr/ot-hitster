'use client';
import { motion, useAnimation } from 'motion/react';
import { useEffect } from 'react';

export type EmojiReaction = { id: string; emoji: string };

export default function TeamCard({
  name,
  className,
  confirmed,
  activeEmojis = [],
  onEmojiDone,
}: {
  name: string;
  className?: string;
  confirmed?: boolean;
  activeEmojis?: EmojiReaction[];
  onEmojiDone?: (id: string) => void;
}) {
  const cardControls = useAnimation();
  const wipeControls = useAnimation();

  useEffect(() => {
    cardControls.start({
      scale: 1,
      transition: { type: 'spring', stiffness: 300, damping: 20 },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (confirmed) {
      wipeControls.start({ scaleX: 1, transition: { duration: 0.3, ease: 'easeInOut' } });
    } else {
      wipeControls.set({ scaleX: 0 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmed]);

  return (
    <div className="relative m-4">
      <motion.div
        initial={{ scale: 0 }}
        animate={cardControls}
        layout
        className={`relative overflow-hidden py-2 px-3 rounded-xl text-3xl ${confirmed === undefined ? `bg-white text-black ${className || ''}` : 'border-2 border-white text-white'}`}
      >
        <motion.div
          initial={{ scaleX: 0 }}
          animate={wipeControls}
          className="absolute inset-0 bg-white"
          style={{ originX: 0 }}
        />
        <span
          className={`relative z-10 transition-colors duration-300 ${confirmed ? 'text-black' : ''}`}
        >
          {name}
        </span>
      </motion.div>
      {activeEmojis.map(({ id, emoji }) => (
        <motion.div
          key={id}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 text-4xl pointer-events-none z-50 select-none"
          initial={{ y: 0, opacity: 1, scale: 0.8, x: 0 }}
          animate={{ y: -260, opacity: 0, scale: 1.5, x: [0, 18, -14, 20, -10, 8, 0] }}
          transition={{
            duration: 2.5,
            ease: 'easeOut',
            x: { duration: 2.5, ease: 'easeInOut' },
          }}
          onAnimationComplete={() => onEmojiDone?.(id)}
        >
          {emoji}
        </motion.div>
      ))}
    </div>
  );
}
