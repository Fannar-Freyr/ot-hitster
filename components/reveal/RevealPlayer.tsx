import { getGuess, Guess } from '@/utils/db/guesses';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function RevealPlayer({
  gameId,
  game,
  playerId,
}: {
  gameId: string;
  game: any;
  playerId: string;
}) {
  const [guess, setGuess] = useState<Guess | null>(null);

  const handleFetchingGuess = () => {
    getGuess({ playerId, gameId, round: game.round }).then((guess: any) => {
      setGuess(guess);
    });
  };

  useEffect(() => {
    handleFetchingGuess();
  }, []);

  if (!guess) {
    return null;
  }

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen py-2 ${guess?.correct ? 'bg-green-600' : 'bg-red-600'}`}
    >
      {guess ? (
        <motion.h1
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-6xl text-white font-bold mb-4"
        >
          {guess.correct ? 'Correct!' : 'Wrong!'}
        </motion.h1>
      ) : (
        <h1 className="text-6xl font-bold mb-4">Loading your guess...</h1>
      )}
    </div>
  );
}
