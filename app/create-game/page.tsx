/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
'use client';
import Button from '@/components/Button';
import { supabase } from '@/utils/db/supabase';
import { useRouter } from 'next/navigation';
import { createGame } from '@/utils/db/game';
import { useEffect, useState } from 'react';
import Loading from '@/components/Loading';
import Image from 'next/image';
import { parseSpotifyPlaylist } from '@/utils/parseSpotifyPlaylist';

export default function CreateGame() {
  const router = useRouter();
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [spotifyPlaylists, setSpotifyPlaylists] = useState([]);
  const [selected, setSelected] = useState<any>(null);
  const [numPoints, setNumPoints] = useState<number>(5);

  const fetchSpotifyPlaylists = async () => {
    if (!spotifyToken) return;
    const res = await fetch('https://api.spotify.com/v1/me/playlists', {
      headers: { Authorization: `Bearer ${spotifyToken}` },
    });
    const data = await res.json();
    setSpotifyPlaylists(
      data.items.sort((a: any, b: any) => a.name.localeCompare(b.name)),
    );
    console.log(data);
  };

  // TODO: Fetch longer playlists. Currently only fetches 100 songs.
  const fetchSpotifyPlaylistWithTracks = async (playlistId: string) => {
    if (!spotifyToken) return;
    const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/items`, {
      headers: { Authorization: `Bearer ${spotifyToken}` },
    });
    const data = await res.json();
    return data;
  };

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.provider_token) {
        setSpotifyToken(session.provider_token);
        localStorage.setItem('spotifyToken', session.provider_token);
      }
      setLoading(false);
    };
    checkSession();

    if (spotifyToken) {
      fetchSpotifyPlaylists();
    }
  }, [spotifyToken]);

  const handleSpotifyLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'spotify',
      options: {
        scopes:
          'streaming user-read-email playlist-read-private user-read-private user-read-playback-state user-modify-playback-state',
        redirectTo: `${window.location.origin}/create-game`,
      },
    });
  };

  const handleCreateGame = async () => {
    if (!selected) {
      console.error('Please select a playlist first!');
      return;
    }
    const spotifyPlaylist = await fetchSpotifyPlaylistWithTracks(selected.id);
    console.log('Fetched playlist with tracks:', spotifyPlaylist);

    if (!spotifyPlaylist) {
      console.error('Selected playlist not be loaded!', selected.id);
      return;
    }

    if (!spotifyPlaylist.items || spotifyPlaylist.items.length === 0) {
      console.error('Selected playlist has no tracks!', selected.id);
      return;
    }

    const playlist = parseSpotifyPlaylist(spotifyPlaylist.items);

    console.log(playlist);

    const result = await createGame({ playlist, winCondition: numPoints });

    if (!result) {
      console.error('Failed to create game with selected playlist!', selected.id);
      return;
    }

    const { game, player, songs } = result;

    localStorage.setItem('playerId', player.id);
    localStorage.setItem('gameId', game.id);
    localStorage.setItem('songs', JSON.stringify(songs));

    router.push(`/game/${game.id}`);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      {!spotifyToken ? (
        <>
          <h1 className="text-5xl font-bold mb-4">{'Login'}</h1>
          <Button onClick={handleSpotifyLogin}>Login with Spotify</Button>
        </>
      ) : (
        <div className="flex flex-col items-center justify-around w-full px-8">
          <h1 className="text-5xl font-bold mb-4">{'Select a playlist'}</h1>
          <div className="max-h-150 overflow-y-scroll p-4 rounded-lg border w-180 mb-8">
            {spotifyPlaylists.map((playlist: any) => (
              <div
                key={playlist.id}
                className="flex items-center mb-2 border rounded-lg w-full bg-white cursor-pointer hover:bg-gray-100 transition-colors min-h-12"
                onClick={() => {
                  setSelected(playlist);
                }}
              >
                {playlist.images && playlist.images[0] && (
                  <Image
                    src={playlist.images[0]?.url}
                    alt={playlist.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 object-cover rounded-l-lg"
                  />
                )}
                <div className="flex flex-row w-full items-center justify-between">
                  <p className="text-lg font-semibold ml-4">{playlist.name}</p>
                  <p className="text-md mr-4">{playlist.items.total} songs</p>
                </div>
              </div>
            ))}
          </div>
          {selected && (
            <>
              <p className="text-lg">Selected playlist: {selected.name}</p>
              <input
                type="number"
                placeholder="Number of points (default 10)"
                defaultValue={5}
                className="border rounded-lg p-2 w-48 mb-4"
                onChange={e => setNumPoints(Number(e.target.value))}
              />
            </>
          )}
          <Button onClick={handleCreateGame}>Create a game</Button>
        </div>
      )}
    </div>
  );
}
