/* eslint-disable @typescript-eslint/no-explicit-any */
export const parseSpotifyPlaylist = (data: any) => {
	const songs = [];
	for (const item of data) {
		if (item.is_local) continue; // Skip local files, as they don't have the necessary metadata
		const track = item.item;
		if (!track || !track.is_playable || track.type !== 'track') continue;
		const year = track.album.release_date ? parseInt(track.album.release_date.slice(0, 4)) : null;
		if (!year) continue; // Skip songs without a valid release year
		songs.push({
			spotify_id: track.id,
			title: track.name,
			artist: track.artists.map((artist: any) => artist.name).join(', '),
			year: year,
		});
	}
	return songs;
}