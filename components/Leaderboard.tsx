/* eslint-disable react-hooks/set-state-in-effect */
import { animate, motion, useMotionValue, useTransform } from 'motion/react';
import { useEffect, useState } from 'react';

export function Leaderboard({ children }: { children: React.ReactNode }) {
  return (
    <motion.div layout className="flex flex-col w-450 gap-4">
      {children}
    </motion.div>
  );
}

const gotScoreDelay = 1;
const showNewScoreDelay = 2;

export function LeaderboardEntry({
  name,
  score,
  gotPoint,
}: {
  name: string;
  score: number;
  gotPoint: boolean;
}) {
  const [displayScore, setDisplayScore] = useState(score);
  const count = useMotionValue(score * 100);
  const rounded = useTransform(() => Math.round(count.get()));

  useEffect(() => {
    if (gotPoint) {
      const timer = setTimeout(() => setDisplayScore(score + 1), gotScoreDelay * 1000);
      const controls = animate(count, (score + 1) * 100, {
        duration: 0.75,
        delay: showNewScoreDelay,
      });
      return () => {
        controls.stop();
        clearTimeout(timer);
      };
    }
  }, []);

  return (
    <motion.div
      initial={{ scaleY: 0.8 }}
      animate={{ scaleY: 1 }}
      layout
      className="w-full flex flex-row"
    >
      <motion.div className="flex justify-between flex-1 py-6 px-8 text-5xl text-white text-shadow-lg bg-[#ffffff0a]  border border-[#ffffff34] border-2 rounded-lg font-bold">
        <span>{name}</span>
        <motion.span>{rounded}</motion.span>
      </motion.div>
      {gotPoint ? (
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: gotScoreDelay }}
          className="py-6 px-8 text-5xl text-white font-bold w-10 text-shadow-lg"
        >
          +100
        </motion.div>
      ) : (
        <motion.div className="py-6 px-8 text-6xl w-10"></motion.div>
      )}
    </motion.div>
  );
}
