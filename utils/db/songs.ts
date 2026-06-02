/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/utils/db/supabase';

interface fetchAllSongsProps {
	gameId: string;
}

interface fetchUnusedSongsProps {
	gameId: string;
}

export interface Song {
	id: string;
	spotify_id: string;
	title: string;
	artist: string;
	year: number;
	game_id: string;
	has_been_used: boolean;
}

export const fetchAllSongs = async ({ gameId }: fetchAllSongsProps) => {
	const { data: songs, error } = await supabase.from('songs').select('*').eq('game_id', gameId);

	if (error) {
		console.error(`Error fetching songs for game ${gameId}`, error);
		return;
	}

	return songs;
};

export const fetchUnusedSongs = async ({ gameId }: fetchUnusedSongsProps) => {
	const { data: songs, error } = await supabase
		.from('songs')
		.select('*')
		.eq('game_id', gameId)
		.eq('has_been_used', false);

	if (error) {
		console.error(`Error fetching unused songs for game ${gameId}`, error);
		return;
	}

	console.log(`Fetched ${songs.length} unused songs for game ${gameId}`);

	return songs;
};

export const markSongAsUsed = async (songIds: string[]) => {
	console.log('songIds', songIds)
	await supabase
		.from('songs')
		.upsert(songIds.map(id => ({ id: id, has_been_used: true })))
};

export const getSong = async (songId: string) => {
	const { data: song, error } = await supabase.from('songs').select('*').eq('id', songId).single();

	if (error) {
		console.error(`Error fetching song with id ${songId}`, error);
		return;
	}

	return song;
}
