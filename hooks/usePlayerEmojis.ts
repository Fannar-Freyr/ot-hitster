import { useState } from 'react';
import type { EmojiReaction } from '@/components/TeamCard';

export function usePlayerEmojis() {
	const [playerEmojis, setPlayerEmojis] = useState<Record<string, EmojiReaction[]>>({});

	const addEmoji = (playerId: string, emoji: string, offset: number) => {
		const id = `${Date.now()}-${Math.random()}`;
		setPlayerEmojis(prev => ({
			...prev,
			[playerId]: [...(prev[playerId] ?? []), { id, emoji, offset }],
		}));
	};

	const removeEmoji = (playerId: string, emojiId: string) => {
		setPlayerEmojis(prev => ({
			...prev,
			[playerId]: (prev[playerId] ?? []).filter(e => e.id !== emojiId),
		}));
	};

	return { playerEmojis, addEmoji, removeEmoji };
}
