export const hexToBase10 = (h: string) => parseInt(h, 16) / 255;

const base10ToHex = (x: number) =>
	Math.round(x * 255)
		.toString(16)
		.padStart(2, '0');

export const hexToVec3 = (h: string) => {
	const r = h.substring(1, 3);
	const g = h.substring(3, 5);
	const b = h.substring(5, 7);

	return [r, g, b].map(hexToBase10) as [number, number, number];
};

export const vec3ToHex = ([r, g, b]: [number, number, number]) =>
	`#${base10ToHex(r)}${base10ToHex(g)}${base10ToHex(b)}`;
