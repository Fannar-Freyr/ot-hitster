/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import Button from '../Button';
import { fetchPlayers, getWinner, Player } from '@/utils/db/players';
import { Leaderboard, LeaderboardEntry } from '../Leaderboard';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function GameOverScreen({ gameId, game }: { gameId: string; game: any }) {
  // const [winner, setWinner] = useState<Player | null>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [screen, setScreen] = useState<string>('leaderboard');

  const changeScreen = () => {
    if (screen === 'leaderboard') {
      setScreen('details');
    } else {
      setScreen('leaderboard');
    }
  };

  useEffect(() => {
    fetchPlayers({ gameId }).then(players => {
      setPlayers(players || []);
      setIsLoading(false);
    });
  }, []);

  const playersArray = [
    { id: 1, name: 'Player 1', score: 10 },
    { id: 2, name: 'Player 2', score: 9 },
    { id: 3, name: 'Player 3', score: 8 },
    { id: 4, name: 'Player 4', score: 7 },
    { id: 5, name: 'Player 5', score: 6 },
  ];

  if (isLoading || players.length === 0) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <div className="fixed top-0 right-0 p-4">
        <Button onClick={changeScreen}>
          {screen === 'leaderboard' ? 'Details' : 'Leaderboard'}
        </Button>
      </div>
      {screen === 'leaderboard' && (
        <>
          <h1 className="text-8xl font-bold text-white fixed top-0 pt-10 text-shadow-lg">
            Final Scores
          </h1>
          <Leaderboard>
            {players.map((player, index) => (
              <LeaderboardEntry
                key={player.id}
                name={player.name}
                score={player.score}
                gotPoint={false}
                finalScores={true}
                index={index}
              />
            ))}
          </Leaderboard>
        </>
      )}
      {screen === 'details' && (
        <>
          <h1 className="text-8xl font-bold text-white fixed top-0 pt-10 text-shadow-lg">
            Final Scores
          </h1>
          details
        </>
      )}
    </div>
  );
}
