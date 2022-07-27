import { derived, writable } from 'svelte/store';
import { hexToVec3, vec3ToHex } from './utils/colors';
import { tweened } from 'svelte/motion';
import { cubicOut } from 'svelte/easing';

export const iterations = (() => {
	const { subscribe, set } = tweened(50, { duration: 500, easing: cubicOut });

	return {
		subscribe,
		set: (value: number) => set(value, { duration: 0 }),
		reset: () => set(50, { duration: 1500 })
	};
})();

export const center = (() => {
	const { subscribe, set } = tweened({ x: 0, y: 0 }, { duration: 500, easing: cubicOut });

	return {
		subscribe,
		set: (value: { x: number; y: number }) => set(value),
		reset: () => set({ x: 0, y: 0 })
	};
})();

export const zoomScale = (() => {
	const { subscribe, set } = tweened(1, { duration: 500, easing: cubicOut });

	return {
		subscribe,
		set: (value: number) => set(value, { duration: 0 }),
		reset: () => set(1)
	};
})();

/**
 * Colors
 */
export const makeColorStore = (_initValue: string | [number, number, number]) => {
	const initialValue = typeof _initValue === 'string' ? hexToVec3(_initValue) : _initValue;

	const { subscribe, set } = tweened(initialValue, {
		duration: 500,
		easing: cubicOut
	});

	return {
		subscribe: subscribe,
		set: (hexValue: string) => {
			set(hexToVec3(hexValue), { duration: 0 });
		},
		reset: () => set(initialValue)
	};
};

export const defaultColor = makeColorStore('#4D80CC');
export const color1 = makeColorStore([0.1, 0.2, 0.3]);
export const color2 = makeColorStore('#BE00CC');
