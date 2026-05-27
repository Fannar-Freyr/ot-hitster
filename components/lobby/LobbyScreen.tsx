/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { supabase } from '@/utils/db/supabase';
import TeamCard from '@/components/TeamCard';
import { useEffect, useState } from 'react';
import Button from '../Button';
import { fetchPlayers } from '@/utils/db/players';
import { fetchAllSongs, markSongAsUsed } from '@/utils/db/songs';
import { insertSongOwners } from '@/utils/db/songOwners';
import { handleGameStatusChange } from '@/utils/gameManager';

export default function LobbyScreen({ gameId, game }: { gameId: string; game: any }) {
  const [players, setPlayers] = useState<any[]>([]);

  const pressedIt = (playerId: string) => {
    setPlayers(prev =>
      prev.map(p => (p.id === playerId ? { ...p, pressed_it: !p.pressed_it } : p)),
    );
  };

  const startGame = async () => {
    console.log('start game!!!!');
    const songs = await fetchAllSongs({ gameId });

    if (!Array.isArray(songs)) {
      console.error('No songs found for game:', gameId);
      return;
    }

    songs.sort(() => 0.5 - Math.random());
    const assignedSongs = [];
    for (let i = 0; i < players.length; i++) {
      assignedSongs.push({ playerId: players[i].id, songId: songs[i].id });
    }

    await insertSongOwners(
      assignedSongs.map(as => ({
        player_id: as.playerId,
        song_id: as.songId,
        game_id: gameId,
      })),
    );

    await markSongAsUsed(assignedSongs.map(song => song.songId));

    await handleGameStatusChange({ gameId });
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPlayers({ gameId }).then(players => {
      setPlayers(players || []);
    });

    const channel = supabase
      .channel(`lobby-screen-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'players',
          filter: `game_id=eq.${gameId}`,
        },
        data => {
          console.log('Player change detected:', data);
          fetchPlayers({ gameId }).then(players => {
            setPlayers(players || []);
          });
        },
      )
      .on('broadcast', { event: 'pressed_it' }, message => {
        pressedIt(message.payload.playerId);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <div className="fixed top-0 right-0 p-4">
        <Button className="bg-slate-600 text-amber-200" onClick={startGame}>
          Start game
        </Button>
      </div>
      <h1 className="text-6xl font-bold mb-4">{game.host_id}</h1>
      <p className="text-2xl">Teams:</p>
      <div className="flex flex-row flex-wrap justify-center">
        {players.map(player => {
          if (!player.name) return null;
          if (player.pressed_it) {
            return (
              <div
                className="m-4 p-2 border-2 border-pink-500 rounded-xl"
                key={player.id}
              >
                {player.name}
              </div>
            );
          }
          return <TeamCard name={player.name} key={player.id} />;
        })}
      </div>
    </div>
  );
}
