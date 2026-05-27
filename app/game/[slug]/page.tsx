/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import Loading from '@/components/Loading';
import LobbyScreen from '@/components/lobby/LobbyScreen';
import LobbyPlayer from '@/components/lobby/LobbyPlayer';
import { supabase } from '@/utils/db/supabase';
import { use, useEffect, useState } from 'react';
import GuessingScreen from '@/components/guessing/GuessingScreen';
import GuessingPlayer from '@/components/guessing/GuessingPlayer';
import RevealScreen from '@/components/reveal/RevealScreen';
import RevealPlayer from '@/components/reveal/RevealPlayer';
import LeaderboardScreen from '@/components/leaderboard/LeaderboardScreen';
import GameOverScreen from '@/components/gameOver/GameOverScreen';
import GameOverPlayer from '@/components/gameOver/GameOverPlayer';

export default function GamePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: gameId } = use(params);
  const [game, setGame] = useState<any>(null);
  const [player, setPlayer] = useState<any>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      const playerId = localStorage.getItem('playerId');

      const [{ data: gameData }, { data: playerData }] = await Promise.all([
        supabase.from('games').select('*').eq('id', gameId).single(),
        playerId
          ? supabase.from('players').select('*').eq('id', playerId).single()
          : Promise.resolve({ data: null }),
      ]);

      setGame(gameData);
      setPlayer(playerData);
    };

    fetchInitialData();

    const channel = supabase
      .channel(`game-status-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`,
        },
        payload => {
          setGame(payload.new);
          console.log('game updated', payload.new);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId]);

  if (!game || !player) {
    return <Loading />;
  }

  switch (game.status) {
    case 'lobby':
      return player.is_dj ? (
        <LobbyScreen gameId={gameId} game={game} />
      ) : (
        <LobbyPlayer gameId={gameId} playerId={player.id} />
      );
    case 'guessing':
      return player.is_dj ? (
        <GuessingScreen gameId={gameId} />
      ) : (
        <GuessingPlayer gameId={gameId} playerId={player.id} />
      );
    case 'reveal':
      return player.is_dj ? (
        <RevealScreen gameId={gameId} game={game} />
      ) : (
        <RevealPlayer gameId={gameId} game={game} playerId={player.id} />
      );
    case 'leaderboard':
      return player.is_dj ? (
        <LeaderboardScreen gameId={gameId} game={game} />
      ) : (
        <RevealPlayer gameId={gameId} game={game} playerId={player.id} />
      );
    case 'game_over':
      return player.is_dj ? (
        <GameOverScreen gameId={gameId} game={game} />
      ) : (
        <GameOverPlayer gameId={gameId} game={game} playerId={player.id} />
      );
    default:
      return <h1 className="text-6xl font-bold mb-4">{'Unknown game state'}</h1>;
  }
}
