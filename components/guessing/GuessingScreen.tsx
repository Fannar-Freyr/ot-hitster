/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/utils/db/supabase';
import Button from '../Button';
import { useEffect, useState } from 'react';
import TeamCard from '../TeamCard';
import { fetchPlayers, updatePlayerScore } from '@/utils/db/players';
import { updateGameStatus } from '@/utils/db/game';
import { getCurrentRound } from '@/utils/db/rounds';
import { handleGameStatusChange } from '@/utils/gameManager';
import { getSong } from '@/utils/db/songs';
import { createGuesses } from '@/utils/db/guesses';
import { insertSongOwners } from '@/utils/db/songOwners';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function GuessingScreen({ gameId }: { gameId: string }) {
  const [players, setPlayers] = useState<any[]>([]);
  const [currentSong, setCurrentSong] = useState<any>(null);
  const [currentRound, setCurrentRound] = useState<any>(null);

  const fetchSong = async (songId: string) => {
    getSong(songId).then(song => {
      setCurrentSong(song);
    });
  };

  const checkGuesses = () => {
    const guesses = [];
    for (const player of players) {
      if (!player.guess) {
        console.log(`Player ${player.name} has not made a guess yet.`);
        guesses.push({
          player_id: player.id,
          game_id: gameId,
          round_id: currentRound.id,
          round: currentRound.round,
          song_id: currentRound.song_id,
          correct: false,
        });
        continue;
      }
      if (player.guess[0] <= currentSong.year && player.guess[1] >= currentSong.year) {
        console.log(`Correct guess from ${player.name}!`);
        guesses.push({
          player_id: player.id,
          game_id: gameId,
          round_id: currentRound.id,
          round: currentRound.round,
          song_id: currentRound.song_id,
          correct: true,
        });
        insertSongOwners([
          {
            player_id: player.id,
            song_id: currentRound.song_id,
            game_id: gameId,
          },
        ]);
        updatePlayerScore({ playerId: player.id, score: player.score + 1 });
      } else {
        console.log(`Wrong guess from ${player.name}!`);
        guesses.push({
          player_id: player.id,
          game_id: gameId,
          round_id: currentRound.id,
          round: currentRound.round,
          song_id: currentRound.song_id,
          correct: false,
        });
      }
    }

    createGuesses(guesses);
  };

  useEffect(() => {
    fetchPlayers({ gameId }).then(players => {
      setPlayers(players || []);
    });
    getCurrentRound({ gameId }).then(round => {
      fetchSong(round.song_id);
      setCurrentRound(round);
      console.log('round.song', round.song_id);
    });
    const channel = supabase
      .channel(`guessing-screen-${gameId}`)
      .on('broadcast', { event: 'guess_confirmed' }, message => {
        console.log('Guess confirmed by player:', message.payload.playerId);

        setPlayers(prev =>
          prev.map(p =>
            p.id === message.payload.playerId
              ? { ...p, has_confirmed: message.payload.has_confirmed }
              : p,
          ),
        );
      })
      .on('broadcast', { event: 'sending-guess' }, message => {
        console.log(
          `Received guess from player (${message.payload.playerId}):`,
          message.payload.guess,
        );
        setPlayers(prev =>
          prev.map(p =>
            p.id === message.payload.playerId
              ? { ...p, guess: message.payload.guess }
              : p,
          ),
        );
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId]);

  const reveal = async () => {
    // supabase.channel(`guessing-screen-${gameId}`).send({
    //   type: 'broadcast',
    //   event: 'reveal',
    //   payload: { revealing: true },
    // });
    checkGuesses();
    handleGameStatusChange({ gameId });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <div className="fixed top-0 right-0 p-4">
        <Button className="bg-slate-600 text-amber-200" onClick={reveal}>
          Reveal
        </Button>
      </div>
      <h1 className="text-6xl font-bold mb-4">A song is playing</h1>
      {currentSong && (
        <>
          <h1 className="text-2xl font-bold mb-4">{currentSong.title}</h1>
          <h1 className="text-2xl font-bold mb-4">{currentSong.artist}</h1>
          <h1 className="text-2xl font-bold mb-4">{currentSong.year}</h1>
        </>
      )}
      <div className="flex flex-row flex-wrap justify-center">
        {players
          .filter(player => !player.is_dj)
          .map(player => (
            <TeamCard
              key={player.id}
              name={`${player.has_confirmed ? '✅' : '🤔'} ${player.name}`}
            />
          ))}
      </div>
    </div>
  );
}
