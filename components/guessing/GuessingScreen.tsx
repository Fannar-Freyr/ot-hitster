/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/utils/db/supabase';
import Button from '../Button';
import { useEffect, useRef, useState } from 'react';
import TeamCard from '../TeamCard';
import { fetchPlayers, updatePlayerScore } from '@/utils/db/players';
import { getCurrentRound } from '@/utils/db/rounds';
import { handleGameStatusChange } from '@/utils/gameManager';
import { getSong } from '@/utils/db/songs';
import { createGuesses } from '@/utils/db/guesses';
import { insertSongOwners } from '@/utils/db/songOwners';
import { getSpotifyToken } from '@/utils/spotify';
import { motion } from 'motion/react';
import PageContainer from '../PageContainer';
import { getPaletteSync } from 'colorthief';
import { useBackground } from '@/context/BackgroundContext';

// Persisted across remounts so the Spotify device stays registered and ready.
let cachedPlayer: any = null;
let cachedDeviceId: string | null = null;

export default function GuessingScreen({ gameId }: { gameId: string }) {
  const { setColors } = useBackground();
  const [players, setPlayers] = useState<any[]>([]);
  const [currentSong, setCurrentSong] = useState<any>(null);
  const [currentRound, setCurrentRound] = useState<any>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef<any>(null);
  const lastPlayedSongIdRef = useRef<string | null>(null);

  const fetchSong = async (songId: string) => {
    const song = await getSong(songId);
    if (!song) return;
    setCurrentSong(song);

    // Derive background colors from the album artwork.
    try {
      const token = await getSpotifyToken();
      const res = await fetch(`https://api.spotify.com/v1/tracks/${song.spotify_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = data.album.images[0].url;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      const palette = getPaletteSync(img, { colorCount: 5 });
      if (!palette) return;
      setColors([
        palette[0].array(),
        palette[1].array(),
        palette[2].array(),
        palette[3].array(),
        palette[0].array(),
        palette[1].array(),
        palette[2].array(),
        palette[3].array(),
      ]);
    } catch (e) {
      console.error('Could not extract palette for guessing screen', e);
    }
  };

  const checkGuesses = () => {
    const guesses = [];
    for (const player of players) {
      const boilerplate = {
        player_id: player.id,
        game_id: gameId,
        round_id: currentRound.id,
        song_id: currentRound.song_id,
        round: currentRound.round,
      };
      if (!player.guess) {
        console.log(`Player ${player.name} has not made a guess yet.`);
        guesses.push({
          ...boilerplate,
          correct: false,
        });
        continue;
      }
      if (player.guess[0] <= currentSong.year && player.guess[1] >= currentSong.year) {
        console.log(`Correct guess from ${player.name}!`);
        guesses.push({
          ...boilerplate,
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
          ...boilerplate,
          correct: false,
        });
      }
    }

    createGuesses(guesses);
  };

  useEffect(() => {
    const attachListeners = (player: any) => {
      // Remove old listeners first to avoid duplicates on remount.
      player.removeListener('ready');
      player.removeListener('not_ready');
      player.removeListener('player_state_changed');

      player.addListener('ready', ({ device_id }: any) => {
        console.log('Ready with Device ID', device_id);
        cachedDeviceId = device_id;
        setDeviceId(device_id);
      });

      player.addListener('not_ready', ({ device_id }: any) => {
        console.log('Device ID has gone offline', device_id);
        cachedDeviceId = null;
        setDeviceId(null);
      });

      player.addListener('player_state_changed', (state: any) => {
        if (!state) return;
        setIsPlaying(!state.paused);
      });
    };

    const initPlayer = () => {
      if (cachedPlayer) {
        // Reuse the existing connected player — no disconnect/reconnect cycle.
        playerRef.current = cachedPlayer;
        attachListeners(cachedPlayer);
        // Restore deviceId from cache so the button is immediately enabled.
        if (cachedDeviceId) setDeviceId(cachedDeviceId);
        return;
      }

      const player = new (window as any).Spotify.Player({
        name: 'OT Hitster Player',
        getOAuthToken: async (cb: any) => {
          cb(await getSpotifyToken());
        },
        volume: 1,
      });

      cachedPlayer = player;
      playerRef.current = player;
      attachListeners(player);
      player.connect();
    };

    if ((window as any).Spotify) {
      initPlayer();
    } else {
      (window as any).onSpotifyWebPlaybackSDKReady = initPlayer;

      const existingScript = document.getElementById('spotify-sdk');
      if (!existingScript) {
        const script = document.createElement('script');
        script.id = 'spotify-sdk';
        script.src = 'https://sdk.scdn.co/spotify-player.js';
        script.async = true;
        document.body.appendChild(script);
      }
    }

    return () => {
      // Do not disconnect — keep the device registered with Spotify across remounts.
      playerRef.current = null;
    };
  }, []);

  useEffect(() => {
    fetchPlayers({ gameId }).then(fetchedPlayers => {
      setPlayers(fetchedPlayers || []);
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

  const play = async () => {
    if (!deviceId || !currentSong) return;
    const spotifyToken = await getSpotifyToken();
    if (!spotifyToken) return;

    const trackUri = `spotify:track:${currentSong.spotify_id}`;

    await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${spotifyToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uris: [trackUri] }),
    });
    console.log(trackUri, 'song is playing');
  };
  const togglePlayPause = () => {
    if (!playerRef.current) return;
    playerRef.current.togglePlay();
  };

  useEffect(() => {
    if (deviceId && currentSong && lastPlayedSongIdRef.current !== currentSong.id) {
      lastPlayedSongIdRef.current = currentSong.id;
      play();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceId, currentSong]);

  const reveal = async () => {
    checkGuesses();
    handleGameStatusChange({ gameId });
  };

  return (
    <PageContainer>
      <div className="fixed top-0 right-0 p-4">
        <Button className="bg-slate-600 text-amber-200" onClick={reveal}>
          Reveal
        </Button>
      </div>
      <h1 className="text-5xl text-white font-bold mb-4">
        [ Cool animation or something ]
      </h1>
      <div className="flex gap-3 mb-6">
        <Button
          className="bg-yellow-500 hover:bg-yellow-400 text-white px-6 py-2"
          onClick={togglePlayPause}
          disabled={!deviceId}
        >
          {isPlaying ? '⏸ Pause' : '▶ Resume'}
        </Button>
      </div>
      <div className="flex flex-col justify-center items-center fixed bottom-4">
        {players.filter(player => !player.is_dj).every(p => p.has_confirmed) && (
          <div className="text-4xl bg-white rounded-lg font-bold mb-4 py-2 px-3">
            Everybody is ready!
          </div>
        )}
        <div className="flex flex-row flex-wrap justify-center">
          {players
            .filter(player => !player.is_dj)
            .map(player => (
              <TeamCard
                key={player.id}
                name={`${player.has_confirmed ? '🔒' : '🔓'} ${player.name}`}
              />
            ))}
        </div>
      </div>
    </PageContainer>
  );
}
