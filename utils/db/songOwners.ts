/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/utils/db/supabase';

type insertSongOwnersProps = { song_id: string; player_id: string, game_id: string }[];

interface fetchPlayerSongs {
	playerId: string
}

export const insertSongOwners = async (songOwners: insertSongOwnersProps) => {
	await supabase
		.from('song_owners')
		.insert(songOwners)
};


export const fetchPlayerSongs = async ({ playerId }: fetchPlayerSongs) => {
	const { data: songs, error } = await supabase
		.from('song_owners')
		.select('*, ...songs(*)')
		.eq('player_id', playerId);

	if (error) {
		console.error(`Error fetching songs for player ${playerId}`, error);
		return;
	}

	return songs;
};