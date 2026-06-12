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

  const playersArray = [
    { id: 1, name: 'Player 1', score: 3 },
    { id: 3, name: 'Player 3', score: 8 },
    { id: 5, name: 'Player 5', score: 6 },
    { id: 2, name: 'Player 2', score: 9 },
    { id: 4, name: 'Player 4', score: 7 },
    { id: 6, name: 'Player 6', score: 5 },
    { id: 7, name: 'Player 7', score: 4 },
    { id: 8, name: 'Player 8', score: 3 },
    { id: 9, name: 'Player 9', score: 2 },
    { id: 10, name: 'Player 10', score: 1 },
    { id: 11, name: 'Player 11', score: 11 },
    { id: 12, name: 'Player 12', score: 12 },
    // { id: 13, name: 'Player 13', score: 13 },
    // { id: 14, name: 'Player 14', score: 14 },
    // { id: 15, name: 'Player 15', score: 15 },
    // { id: 16, name: 'Player 16', score: 16 },
    // { id: 17, name: 'Player 17', score: 17 },
    // { id: 18, name: 'Player 18', score: 18 },
    // { id: 19, name: 'Player 19', score: 19 },
    // { id: 20, name: 'Player 20', score: 20 },
    // { id: 21, name: 'Player 21', score: 21 },
    // { id: 22, name: 'Player 22', score: 22 },
    // { id: 23, name: 'Player 23', score: 23 },
    // { id: 24, name: 'Player 24', score: 24 },
    // { id: 25, name: 'Player 25', score: 25 },
  ];

  useEffect(() => {
    fetchPlayers({ gameId }).then(players => {
      if (!players) return;
      const sortPlayers = players.sort((a, b) => b.score - a.score);
      setPlayers(sortPlayers || []);
      setIsLoading(false);
    });
    // const sortPlayers = playersArray.sort((a, b) => b.score - a.score);
    // // eslint-disable-next-line react-hooks/set-state-in-effect
    // setPlayers(sortPlayers || []);
    // setIsLoading(false);
  }, []);

  if (isLoading || players.length === 0) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      {/* <div className="fixed top-0 right-0 p-4">
        <Button onClick={changeScreen}>
          {screen === 'leaderboard' ? 'Details' : 'Leaderboard'}
        </Button>
      </div> */}
      {screen === 'leaderboard' && (
        <>
          <h1 className="text-6xl font-bold text-white text-shadow-lg mb-6">
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
