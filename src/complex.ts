export type Complex = readonly [number, number];

export const magnitude = ([re, im]: Complex): number =>
	Math.sqrt(Math.pow(re, 2) + Math.pow(im, 2));

export const square = ([re, im]: Complex): Complex => [
	Math.pow(re, 2) - Math.pow(im, 2),
	2 * re * im
];

export const add = (a: Complex, b: Complex): Complex => [a[0] + b[0], a[1] + b[1]];
