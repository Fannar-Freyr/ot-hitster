'use client';
import { useState } from 'react';
import { supabase } from '@/utils/db/supabase';
import Button from '@/components/Button';
import { useRouter } from 'next/navigation';

export default function Lobby() {
  const [name, setName] = useState<string>('');
  const [hostId, setHostId] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const router = useRouter();

  const createGame = async () => {
    router.push(`/create-game`);
  };

  const joinGame = async () => {
    const { data: game } = await supabase
      .from('games')
      .select('id')
      .eq('host_id', hostId)
      .single();

    if (!game) {
      console.error('Game not found');
      setError(true);
      return;
    }

    const { data: player } = await supabase
      .from('players')
      .insert({ name, game_id: game.id })
      .select()
      .single();

    localStorage.setItem('playerId', player.id);
    localStorage.setItem('gameId', game.id);

    router.push(`/game/${game.id}`);
  };

  return (
    <>
      <div className="fixed top-0 right-0 p-4">
        {/* <Button className="bg-slate-600 text-amber-200" onClick={createGame}>
          Create game
        </Button> */}
      </div>
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <h1 className="text-3xl font-bold mb-4">Enter game code</h1>
        <input
          type="text"
          value={hostId}
          onChange={e => setHostId(e.target.value.toUpperCase())}
        />

        <h1 className="text-3xl font-bold mb-4 pt-8">Choose team name</h1>
        <input type="text" onChange={e => setName(e.target.value)} />
        <p className={`text-red-500 mt-4 ${error ? 'block' : 'hidden'}`}>
          Game not found
        </p>
        <Button onClick={joinGame}>Join game</Button>
      </div>
    </>
  );
}
