import { useState, useRef } from "react";

type Emoji = {
	id: number;
	symbol: string;
	x: number;
	size: number;
	drift: number;
	duration: number;
	delay: number;
};

export function useEmojiSpawner() {
	const [emojis, setEmojis] = useState<Emoji[]>([]);
	const containerRef = useRef<HTMLDivElement | null>(null);

	const spawnEmojis = (symbols: string[], count = 10) => {
		const container = containerRef.current;
		if (!container) return;

		const rect = container.getBoundingClientRect();

		const newEmojis: Emoji[] = Array.from({ length: count }).map(() => ({
			id: Math.random(),
			symbol: symbols[Math.floor(Math.random() * symbols.length)],
			x: Math.random() * rect.width,
			size: 20 + Math.random() * 30,
			drift: (Math.random() - 0.5) * 120,
			duration: 1.5 + Math.random() * 1,
			delay: Math.random() * 0.4,
		}));

		setEmojis((prev) => [...prev, ...newEmojis]);
	};

	const removeEmoji = (id: number) => {
		setEmojis((prev) => prev.filter((e) => e.id !== id));
	};

	return { containerRef, emojis, spawnEmojis, removeEmoji };
}