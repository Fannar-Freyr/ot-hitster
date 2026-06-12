/* eslint-disable react-hooks/set-state-in-effect */
import { animate, motion, useMotionValue, useTransform } from 'motion/react';
import { useEffect, useState } from 'react';

export function Leaderboard({ children }: { children: React.ReactNode }) {
  return (
    <motion.div layout className="flex flex-col w-325 gap-2">
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
  finalScores = false,
  index = 0,
}: {
  name: string;
  score: number;
  gotPoint: boolean;
  finalScores?: boolean;
  index?: number;
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

  const crownPlayer = (name: string, index: number) => {
    if (index === 0) return `👑 ${name}`;
    if (index === 1) return `🥈 ${name}`;
    if (index === 2) return `🥉 ${name}`;
    return name;
  };

  const textSize = 'text-4xl';
  const rowStyle = `flex justify-between flex-1 py-3 px-8 ${textSize} text-white text-shadow-lg bg-[#0000000a]  border border-[#0000001e] border-2 rounded-lg font-bold`;

  if (finalScores) {
    return (
      <motion.div
        initial={{ scaleY: 0.8 }}
        animate={{ scaleY: 1 }}
        layout
        className="w-full flex flex-row"
      >
        <motion.div className={rowStyle}>
          <span>{crownPlayer(name, index)}</span>
          <motion.span>{rounded}</motion.span>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ scaleY: 0.8 }}
      animate={{ scaleY: 1 }}
      layout
      className="w-full flex flex-row"
    >
      <motion.div className={rowStyle}>
        <span>{name}</span>
        <motion.span>{rounded}</motion.span>
      </motion.div>
      {gotPoint ? (
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: gotScoreDelay }}
          className={`py-4 px-8 ${textSize} text-white font-bold w-10 text-shadow-lg`}
        >
          +100
        </motion.div>
      ) : (
        <motion.div className={`py-4 px-8 ${textSize} w-10`}></motion.div>
      )}
    </motion.div>
  );
}
