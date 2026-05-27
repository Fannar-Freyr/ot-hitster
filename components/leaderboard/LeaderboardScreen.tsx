/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/utils/db/supabase';
import Button from '../Button';
import { useEffect, useState } from 'react';
import Loading from '../Loading';
import { updateGameStatus } from '@/utils/db/game';
import { fetchPlayers } from '@/utils/db/players';
import { handleGameStatusChange } from '@/utils/gameManager';

export default function LeaderboardScreen({
  gameId,
  game,
}: {
  gameId: string;
  game: any;
}) {
  const [players, setPlayers] = useState<any[]>([]);

  useEffect(() => {
    fetchPlayers({ gameId }).then(players => {
      setPlayers(players || []);
    });
  }, []);

  const goToNextSong = async () => {
    handleGameStatusChange({ gameId });
  };

  if (players.length === 0) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <div className="fixed top-0 right-0 p-4">
        <Button className="bg-slate-600 text-amber-200" onClick={goToNextSong}>
          Next song
        </Button>
      </div>
      <h1 className="text-6xl font-bold mb-4">Leaderboard</h1>
      <div>
        {players
          .filter(player => !player.is_dj)
          .sort((a, b) => b.score - a.score)
          .map(player => (
            <div key={player.id} className="text-2xl">
              {player.name}: {player.score} points
            </div>
          ))}
      </div>
    </div>
  );
}
