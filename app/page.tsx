'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/db/supabase';
import Button from '@/components/Button';
import { useRouter } from 'next/navigation';
import { generateRoomCode } from '@/utils/generateRoomCode';

export default function Lobby() {
  const [name, setName] = useState<string>('');
  const [hostId, setHostId] = useState<string>('');
  const router = useRouter();

  const createGame = async () => {
    // const { data: game, error } = await supabase
    //   .from('games')
    //   .insert({ host_id: generateRoomCode() })
    //   .select('id')
    //   .single();

    // if (error) {
    //   console.error('Error creating game:', error);
    //   return;
    // }

    // console.log('Game created:', game);

    // const { data: player } = await supabase
    //   .from('players')
    //   .insert({ game_id: game.id, is_dj: true })
    //   .select()
    //   .single();

    // localStorage.setItem('playerId', player.id);
    // localStorage.setItem('gameId', game.id);

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
      return;
    }

    console.log('Game found:', game);

    const { data: player } = await supabase
      .from('players')
      .insert({ name, game_id: game.id })
      .select()
      .single();

    // const channel = supabase
    //   .channel(`game-${game.id}`)
    //   .send({ type: 'broadcast', event: 'player_joined', payload: { player: player } });

    localStorage.setItem('playerId', player.id);
    localStorage.setItem('gameId', game.id);

    router.push(`/game/${game.id}`);
  };

  return (
    <>
      <div className="fixed top-0 right-0 p-4">
        <Button className="bg-slate-600 text-amber-200" onClick={createGame}>
          Create game
        </Button>
      </div>
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <h1 className="text-4xl font-bold mb-4">Enter game code</h1>
        <input
          type="text"
          value={hostId}
          onChange={e => setHostId(e.target.value.toUpperCase())}
        />

        <h1 className="text-4xl font-bold mb-4 pt-8">Choose team name</h1>
        <input type="text" onChange={e => setName(e.target.value)} />
        <Button onClick={joinGame}>Join game</Button>
      </div>
    </>
  );
}
