import { useCallback } from 'react';
import { supabase } from '@/utils/db/supabase';

export function useEmojiSender({
	channelName,
	playerId,
}: {
	channelName: string;
	playerId: string;
}) {
	const sendEmoji = useCallback(
		(emoji: string) => {
			supabase.channel(channelName).send({
				type: 'broadcast',
				event: 'emoji_reaction',
				payload: { playerId, emoji },
			});
		},
		// Channel name and playerId are stable for the lifetime of the component.
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[],
	);

	return { sendEmoji };
}
