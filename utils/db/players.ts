/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/utils/db/supabase';

interface fetchPlayersProps {
	gameId: string;
}

export interface Player {
	id: string;
	name: string;
	score: number;
	is_dj: boolean;
	game_id: string;
}

export const fetchPlayers = async ({ gameId }: fetchPlayersProps) => {
	const { data: players } = await supabase
		.from('players')
		.select('*')
		.eq('game_id', gameId)
		.filter('is_dj', 'eq', false);

	if (!players) {
		console.error(`Error fetching players for game ${gameId}`);
		return;
	}

	return players;
};

export const getWinner = async (gameId: string) => {
	const { data: winner, error } = await supabase
		.from('players')
		.select('*')
		.eq('game_id', gameId)
		.order('score', { ascending: false })
		.limit(1)
		.single();

	if (error) {
		console.error(`Error fetching winner for game ${gameId}`, error);
		return;
	}

	return winner
}

export const checkIfWinner = async ({ playerId, gameId }: { playerId: string; gameId: string }) => {
	const winner = await getWinner(gameId);
	return winner?.id === playerId;
}

export const updatePlayerScore = async ({ playerId, score }: { playerId: string; score: number }) => {
	await supabase.from('players')
		.update({ score })
		.eq('id', playerId);
};