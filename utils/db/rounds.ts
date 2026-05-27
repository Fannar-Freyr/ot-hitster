import { supabase } from "./supabase";

export const createNewRound = async ({ gameId, round, songId }: { gameId: string, round: number, songId: string }) => {
	await supabase.from('rounds').insert({ game_id: gameId, round, song_id: songId });
}

export const getCurrentRound = async ({ gameId }: { gameId: string }) => {
	const { data: round, error } = await supabase
		.from('rounds')
		.select('*, songs(*)')
		.eq('game_id', gameId)
		.order('round', { ascending: false })
		.limit(1)
		.single();

	if (error) {
		console.error(`Error fetching current round for game ${gameId}`, error);
		return;
	}

	return round;
}