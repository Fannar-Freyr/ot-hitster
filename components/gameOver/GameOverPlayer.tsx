/* eslint-disable react-hooks/set-state-in-effect */
import { checkIfWinner } from '@/utils/db/players';
import { useEffect, useState } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function GameOverPlayer({
  gameId,
  game,
  playerId,
}: {
  gameId: string;
  game: any;
  playerId: string;
}) {
  const [isWinner, setIsWinner] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const winnerOrLoser = async () => {
    const isWinner = await checkIfWinner({ playerId, gameId });
    setIsWinner(isWinner);
    setIsLoading(false);
  };

  useEffect(() => {
    winnerOrLoser();
  }, []);

  if (isLoading) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      {isWinner ? (
        <h1 className="text-6xl font-bold mb-4">You won!</h1>
      ) : (
        <h1 className="text-6xl font-bold mb-4">You lost!</h1>
      )}
    </div>
  );
}
