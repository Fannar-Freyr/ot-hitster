import { supabase } from '@/utils/db/supabase';
import Button from '../Button';
import { handleGameStatusChange } from '@/utils/gameManager';
import { useEffect, useState } from 'react';
import { getCurrentRound } from '@/utils/db/rounds';
import { Song } from '@/utils/db/songs';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function RevealScreen({ gameId, game }: { gameId: string; game: any }) {
  const [song, setSong] = useState<Song | null>(null);

  const goToLeaderboard = async () => {
    handleGameStatusChange({ gameId });
  };

  const fetchCurrentSong = async () => {
    getCurrentRound({ gameId }).then(round => {
      setSong(round.songs);
      console.log(round.songs);
    });
  };

  useEffect(() => {
    fetchCurrentSong();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <div className="fixed top-0 right-0 p-4">
        <Button className="bg-slate-600 text-amber-200" onClick={goToLeaderboard}>
          Leaderboard
        </Button>
      </div>
      {song && (
        <>
          <h1 className="text-6xl font-bold mb-4">{song.title}</h1>
          <h1 className="text-3xl font-bold mb-4">{song.artist}</h1>
          <h1 className="text-6xl font-bold mb-4">{song.year}</h1>
        </>
      )}
    </div>
  );
}
