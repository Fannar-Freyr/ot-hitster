/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import { getColor, getPalette } from 'colorthief';
import { supabase } from '@/utils/db/supabase';
import Button from '../Button';
import { handleGameStatusChange } from '@/utils/gameManager';
import { useEffect, useState } from 'react';
import { getCurrentRound } from '@/utils/db/rounds';
import { Song } from '@/utils/db/songs';
import { motion } from 'motion/react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function RevealScreen({ gameId, game }: { gameId: string; game: any }) {
  const [song, setSong] = useState<Song | null>(null);
  const [spotifySong, setSpotifySong] = useState<any>(null);
  const [palette, setPalette] = useState<any>(null);

  const goToLeaderboard = async () => {
    handleGameStatusChange({ gameId });
  };

  const fetchCurrentSong = async () => {
    getCurrentRound({ gameId }).then(async round => {
      setSong(round.songs);
      console.log(round.songs);
      const spotifyToken = localStorage.getItem('spotifyToken');
      // Fetch song from Spotify
      try {
        const response = await fetch(
          `https://api.spotify.com/v1/tracks/${round.songs.spotify_id}`,
          {
            headers: {
              Authorization: `Bearer ${spotifyToken}`,
              'Content-Type': 'application/json',
            },
          },
        );
        const spotifyData = await response.json();
        setSpotifySong(spotifyData);
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = spotifyData.album.images[0].url;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
        const palette = await getPalette(img, {
          colorCount: 5,
        });
        console.log(palette);
        setPalette(palette);
        console.log(spotifyData);
      } catch (error) {
        console.error('Error fetching Spotify song:', error);
      }
    });
  };

  useEffect(() => {
    fetchCurrentSong();
  }, []);

  if (!palette || !spotifySong || !song) return null;

  const bgGradient = `linear-gradient(135deg, ${palette[0].hex()} 0%, ${palette[2].hex()} 60%, ${palette[4].hex()} 100%)`;
  const textColor = palette[0].textColor;
  const subtleColor =
    textColor === '#ffffff' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)';

  return (
    <div
      style={{ background: bgGradient }}
      className="flex items-center justify-center min-h-screen w-full px-20 gap-20"
    >
      <div className="fixed top-0 right-0 p-4">
        <Button onClick={goToLeaderboard}>Leaderboard</Button>
      </div>

      {/* Album artwork */}
      <motion.img
        initial={{ opacity: 1, scale: 1, x: -1000 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        // transition={{ duration: 0.8, ease: 'easeOut' }}
        src={spotifySong.album.images[0].url}
        className="rounded-3xl shadow-2xl shrink-0"
        style={{ height: '70vh', width: 'auto' }}
      />

      {/* Song info */}
      <div className="flex flex-col justify-center gap-6 min-w-0">
        <p
          style={{ color: subtleColor }}
          className="text-2xl uppercase tracking-[0.3em] font-medium"
        >
          {spotifySong.album.name}
        </p>
        <h1
          style={{ color: textColor, textShadow: '0 2px 24px rgba(0,0,0,0.25)' }}
          className="text-8xl font-black leading-tight wrap-break-word"
        >
          {song.title}
        </h1>
        <h2 style={{ color: textColor }} className="text-5xl font-light tracking-wide">
          {song.artist}
        </h2>
        <div style={{ borderColor: subtleColor }} className="border-t pt-8 mt-2">
          <span
            style={{ color: textColor, textShadow: '0 2px 32px rgba(0,0,0,0.2)' }}
            className="text-[10rem] font-black leading-none"
          >
            {song.year}
          </span>
        </div>
      </div>
    </div>
  );
}
