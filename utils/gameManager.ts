/* eslint-disable @typescript-eslint/no-explicit-any */
import { getGame, updateGameRound, updateGameStatus } from "./db/game";
import { createNewRound } from "./db/rounds";
import { fetchUnusedSongs, markSongAsUsed } from "./db/songs";

export const handleGameStatusChange = async ({ gameId, }: { gameId: string }) => {
	getGame(gameId).then(async game => {
		if (!game) {
			console.error(`Game with id ${gameId} not found`);
			return;
		}

		console.log('🔧 Game Manager', game)

		switch (game.status) {
			case 'lobby':
				await handleGoToNextSong({ game });
				await updateGameStatus({ gameId, status: 'guessing' });
				break;
			case 'guessing':
				await updateGameStatus({ gameId, status: 'reveal' });
				break;
			case 'reveal':
				await updateGameStatus({ gameId, status: 'leaderboard' });
				break;
			case 'leaderboard':
				// TODO: Check if there is a winner
				const players = game.players.filter((player: any) => player.score >= game.win_condition);
				if (players.length > 0) {
					console.log(`Game ${gameId} has a winner:`, players);
					await updateGameStatus({ gameId, status: 'game_over' });
				} else {
					await handleGoToNextSong({ game });
					await updateGameStatus({ gameId, status: 'guessing' });
				}
				break;
			default:
				console.warn(`Game ${gameId} has unknown status: ${game.status}`);
		}

	});
}

export const handleGoToNextSong = async ({ game }: { game: any }) => {
	let nextSong = { id: '' };
	console.log('Selecting next song for game:', game);
	await fetchUnusedSongs({ gameId: game.id }).then(songs => {
		if (!songs || songs.length === 0) {
			console.log(`No more unused songs for game ${game.id}`);
			return;
		}
		nextSong = songs[Math.floor(Math.random() * songs.length)];
	});
	if (!nextSong) {
		console.error(`Failed to select a next song for game ${game.id}`);
		return;
	}
	await markSongAsUsed([nextSong.id]);
	await createNewRound({ gameId: game.id, round: game.round + 1, songId: nextSong.id });
	await updateGameRound({ gameId: game.id, round: game.round });
}