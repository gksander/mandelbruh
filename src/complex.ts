export type Complex = { re: number; im: number };

export const magnitude = (c: Complex): number => Math.sqrt(Math.pow(c.re, 2) + Math.pow(c.im, 2));

export const square = (c: Complex): Complex => ({
	re: Math.pow(c.re, 2) - Math.pow(c.im, 2),
	im: 2 * c.re * c.im
});

export const add = (a: Complex, b: Complex): Complex => ({
	re: a.re + b.re,
	im: a.im + b.im
});
