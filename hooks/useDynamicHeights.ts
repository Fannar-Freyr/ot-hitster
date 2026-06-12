import { useEffect, useState } from "react";

export default function useDynamicHeights(count: number, time: number, minHeight: number, maxHeight: number) {
	const [heights, setHeights] = useState(
		Array.from({ length: count }, () => minHeight)
	);

	useEffect(() => {
		const interval = setInterval(() => {
			setHeights((prev) =>
				prev.map((value, i) => {
					const newValue = minHeight + Math.random() * maxHeight;
					const t = i / (count - 1);       // 0 → 1
					const weight = Math.cos((t - .5) * Math.PI) + 0.2; // 1 center, 0 edges

					return Math.max(newValue * weight, minHeight);

				})
			);
		}, time);

		return () => clearInterval(interval);
	}, []);

	return heights;
}