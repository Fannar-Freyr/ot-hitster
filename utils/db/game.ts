/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/utils/db/supabase';
import { generateRoomCode } from '../generateRoomCode';

interface createGameProps {
	playlist: any[];
	winCondition?: number;
}

interface updateGameStatusProps {
	gameId: string;
	status: string;
}

export const createGame = async ({ playlist, winCondition = 5 }: createGameProps) => {
	const { data: game, error: gameError } = await supabase
		.from('games')
		.insert({
			host_id: generateRoomCode(),
			win_condition: winCondition,
		})
		.select('id')
		.single();

	if (gameError) {
		console.error('Error creating game', gameError);
		return;
	}

	const { data: songs, error: songsError } = await supabase
		.from('songs')
		.insert(playlist.map(song => ({ ...song, game_id: game.id })))
		.filter('game_id', 'eq', game.id)
		.select('*');

	if (songsError) {
		console.error(`Error creating songs for game ${game.id}`, songsError);
		return;
	}

	const { data: player, error: playersError } = await supabase
		.from('players')
		.insert({ game_id: game.id, is_dj: true })
		.select()
		.single();

	if (playersError) {
		console.error(`Error creating DJ for game ${game.id}`, playersError);
		return;
	}

	return { game, songs, player };
};

export const getGame = async (gameId: string) => {
	const { data: game, error } = await supabase
		.from('games')
		.select('*, players(*), rounds(*, songs(*))')
		.eq('id', gameId)
		.single();

	if (error) {
		console.error(`Error fetching game with id ${gameId}`, error);
	}

	return game;
};

export const updateGameStatus = async ({ gameId, status }: updateGameStatusProps) => {
	await supabase.from('games').update({ status }).eq('id', gameId);
};

export const updateGameRound = async ({ gameId, round }: { gameId: string; round: number }) => {
	await supabase.from('games').update({ round: round + 1 }).eq('id', gameId);
}
