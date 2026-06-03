import { supabase } from './db/supabase';

const TOKEN_LIFETIME_MS = 55 * 60 * 1000; // 55 min — Spotify tokens last 60 min

/**
 * Returns a valid Spotify access token, refreshing via Supabase if the
 * stored token is older than 55 minutes.
 */
export async function getSpotifyToken(): Promise<string | null> {
	const stored = localStorage.getItem('spotifyToken');
	const storedAt = Number(localStorage.getItem('spotifyTokenStoredAt') ?? 0);

	if (stored && Date.now() - storedAt < TOKEN_LIFETIME_MS) {
		return stored;
	}

	// Token is missing or stale — ask Supabase to refresh the session.
	const {
		data: { session },
	} = await supabase.auth.refreshSession();

	if (session?.provider_token) {
		localStorage.setItem('spotifyToken', session.provider_token);
		localStorage.setItem('spotifyTokenStoredAt', String(Date.now()));
		if (session.provider_refresh_token) {
			localStorage.setItem('spotifyRefreshToken', session.provider_refresh_token);
		}
		return session.provider_token;
	}

	// Refresh didn't yield a new token — fall back to whatever is stored.
	return stored;
}
