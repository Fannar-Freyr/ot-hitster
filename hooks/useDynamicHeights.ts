import { useEffect, useState } from "react";

export default function useDynamicHeights(count: number) {
	const [heights, setHeights] = useState(
		Array.from({ length: count }, () => 20)
	);

	useEffect(() => {
		const interval = setInterval(() => {
			setHeights((prev) =>
				prev.map(() => 20 + Math.random() * 100)
			);
		}, 120);

		return () => clearInterval(interval);
	}, []);

	return heights;
}