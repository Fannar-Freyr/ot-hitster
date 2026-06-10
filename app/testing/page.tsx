'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import Button from '@/components/Button';
import { getWinner, Player } from '@/utils/db/players';
import { Leaderboard, LeaderboardEntry } from '@/components/Leaderboard';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function GameOverScreen({ gameId, game }: { gameId: string; game: any }) {
  // const [winner, setWinner] = useState<Player | null>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const goToDetails = () => {
    console.log('GOING TO DETAILS BRO');
  };

  const playersArray = [
    { id: 1, name: 'Player 1', score: 10 },
    { id: 2, name: 'Player 2', score: 9 },
    { id: 3, name: 'Player 3', score: 8 },
    { id: 4, name: 'Player 4', score: 7 },
    { id: 5, name: 'Player 5', score: 6 },
  ];

  // const fetchWinner = async () => {
  //   getWinner(gameId).then(winner => {
  //     setWinner(winner);
  //     setIsLoading(false);
  //   });
  // };

  // useEffect(() => {
  //   fetchWinner();
  // }, []);

  // if (isLoading || !players) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <div className="fixed top-0 right-0 p-4">
        <Button className="bg-slate-600 text-amber-200" onClick={goToDetails}>
          Details
        </Button>
      </div>
      <h1 className="text-6xl font-bold mb-4">Game Over</h1>
      {/* {<h1 className="text-3xl font-bold mb-4">Winner: {winner.name}</h1>} */}
      <Leaderboard>
        {playersArray.map(player => (
          <LeaderboardEntry
            key={player.id}
            name={player.name}
            score={player.score}
            gotPoint={false}
          />
        ))}
      </Leaderboard>
    </div>
  );
}
