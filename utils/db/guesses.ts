import { supabase } from "./supabase";

export interface Guess {
	player_id: string;
	game_id: string;
	round_id: string;
	correct: boolean;
}

type Guesses = Guess[];

export const createGuesses = async (guesses: Guesses) => {
	await supabase.from('guesses').insert(guesses);
}

export const getGuess = async ({ playerId, gameId, round }: { playerId: string; gameId: string; round: number }) => {
	const { data: guess, error } = await supabase
		.from('guesses')
		.select('*')
		.eq('player_id', playerId)
		.eq('game_id', gameId)
		.eq('round', round)
		.single();

	if (error) {
		console.error(`Error fetching guess for player ${playerId} in game ${gameId} round ${round}`, error);
		return;
	}

	return guess;
}