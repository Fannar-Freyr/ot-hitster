import { useEffect, useState } from 'react';
import Button from '../Button';
import { getWinner, Player } from '@/utils/db/players';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function GameOverScreen({ gameId, game }: { gameId: string; game: any }) {
  const [winner, setWinner] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const goToDetails = () => {
    console.log('GOING TO DETAILS BRO');
  };

  const fetchWinner = async () => {
    getWinner(gameId).then(winner => {
      setWinner(winner);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    fetchWinner();
  }, []);

  if (isLoading || !winner) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <div className="fixed top-0 right-0 p-4">
        <Button className="bg-slate-600 text-amber-200" onClick={goToDetails}>
          Details
        </Button>
      </div>
      <h1 className="text-6xl font-bold mb-4">Game Over</h1>
      {<h1 className="text-3xl font-bold mb-4">Winner: {winner.name}</h1>}
      <h1 className="text-3xl font-bold mb-4">Everyone out, now! 😤</h1>
    </div>
  );
}
