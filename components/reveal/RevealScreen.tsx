/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import { getColor, getPalette, getPaletteSync, getSwatchesSync } from 'colorthief';
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
        const palette = getPaletteSync(img, {
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

  const bgGradient = createLayeredGradient(palette.map((c: any) => c.css('oklch')));
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
        initial={{ opacity: 0.8, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        // transition={{ duration: 0.8, ease: 'easeOut' }}
        src={spotifySong.album.images[0].url}
        className="rounded-3xl shadow-2xl shrink-0"
        style={{ height: '70vh', width: 'auto' }}
      />

      {/* Song info */}
      <motion.div
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        transition={{ duration: 1 }}
        className="flex flex-col justify-center gap-6 min-w-0"
      >
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
      </motion.div>
    </div>
  );
}

/**
 * Creates a layered CSS gradient from 3–5 colors
 * @param {string[]} colors - Array of CSS color strings (length 3–5)
 * @param {object} options - Optional config
 * @param {number} options.angle - Base angle of gradients (default 135)
 * @returns {string} CSS background value
 */
function createLayeredGradient(colors: any, options = { angle: 135 }) {
  if (!Array.isArray(colors) || colors.length < 3 || colors.length > 5) {
    throw new Error('Provide an array of 3 to 5 CSS color strings.');
  }

  const angle = options.angle;

  // Helper to add transparency to colors (simple approach)
  const withAlpha = (color: string, alpha: number) => {
    // Works if user passes rgb/rgba, otherwise fallback
    if (color.startsWith('rgb')) {
      return color.replace(/rgba?\(([^)]+)\)/, (_, values: any) => {
        const parts = values.split(',').map(v => v.trim());
        return `rgba(${parts.slice(0, 3).join(', ')}, ${alpha})`;
      });
    }
    return color; // fallback for hex/named colors
  };

  // Create layered gradients with slight angle + opacity variations
  const layers = colors.map((color, i) => {
    const nextColor = colors[i + 1] || colors[0];
    const layerAngle = angle + i * 20;
    const start = withAlpha(color, 0.8 - i * 0.1);
    const end = withAlpha(nextColor, 0.8 - i * 0.1);

    return `linear-gradient(${layerAngle}deg, ${start}, ${end})`;
  });

  return layers.join(', ');
}
