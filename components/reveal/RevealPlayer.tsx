import { getGuess, Guess } from '@/utils/db/guesses';
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
      console.log(guess);
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
      className={`flex flex-col items-center justify-center min-h-screen py-2 ${guess?.correct ? 'bg-green-500' : 'bg-red-500'}`}
    >
      <h1 className="text-6xl font-bold mb-4">{game.round}</h1>
      {guess ? (
        <h1 className="text-6xl font-bold mb-4">
          {guess.correct ? 'Correct!' : 'Wrong'}
        </h1>
      ) : (
        <h1 className="text-6xl font-bold mb-4">Loading your guess...</h1>
      )}
    </div>
  );
}
