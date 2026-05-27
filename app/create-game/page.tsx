'use client';
import Button from '@/components/Button';
import { generateRoomCode } from '@/utils/generateRoomCode';
import { supabase } from '@/utils/db/supabase';
import { useRouter } from 'next/navigation';
import { playlist } from '@/utils/playlist';
import { createGame } from '@/utils/db/game';

export default function CreateGame() {
  const router = useRouter();

  const handleCreateGame = async () => {
    const result = await createGame({ playlist });

    if (!result) return;

    const { game, player, songs } = result;

    localStorage.setItem('playerId', player.id);
    localStorage.setItem('gameId', game.id);
    localStorage.setItem('songs', JSON.stringify(songs));

    router.push(`/game/${game.id}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-6xl font-bold mb-4">
        {'Import a playlist probably hopefully'}
      </h1>
      <Button onClick={handleCreateGame}>Create a game</Button>
    </div>
  );
}
