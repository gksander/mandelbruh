import { hexToVec3, vec3ToHex } from './utils/colors';
import { tweened } from 'svelte/motion';
import { cubicOut } from 'svelte/easing';
import { preprocess, z } from 'zod';

// URL helpers
const url = new URL(window.location.href);
const qp = url.searchParams;
const setQp = (key: string, value: string) => {
	qp.set(key, value);
	window.history.replaceState(null, '', url);
};

// Defaults
const DEFAULTS = {
	ITERATIONS: 50,
	CENTER: { x: 0, y: 0 },
	SCALE: 1,
	BOUND_COLOR: '#4D80CC',
	TRANS_COLOR: '#BE00CC',
	ESCAPE_COLOR: '#4D4D4D'
};
const KEYS = {
	ITERATIONS: 'iterations',
	CENTER: 'center',
	SCALE: 'scale',
	BOUND_COLOR: 'boundColor',
	TRANS_COLOR: 'transitionColor',
	ESCAPE_COLOR: 'escapeColor'
} as const;

export const iterations = (() => {
	const { subscribe, set } = tweened(DEFAULTS.ITERATIONS, { duration: 500, easing: cubicOut });

	return {
		subscribe,
		set: (value: number) => {
			set(value, { duration: 0 });
			setQp(KEYS.ITERATIONS, String(value));
		},
		reset: () => {
			set(DEFAULTS.ITERATIONS, { duration: 1500 }).then(() =>
				setQp(KEYS.ITERATIONS, String(DEFAULTS.ITERATIONS))
			);
		}
	};
})();

export const center = (() => {
	const { subscribe, set } = tweened(Object.assign({}, DEFAULTS.CENTER), {
		duration: 500,
		easing: cubicOut
	});

	return {
		subscribe,
		set: (value: { x: number; y: number }) => {
			set(value, { duration: 0 });
			setQp(KEYS.CENTER, `${value.x},${value.y}`);
		},
		reset: () =>
			set(Object.assign({}, DEFAULTS.CENTER)).then(() =>
				setQp(KEYS.CENTER, `${DEFAULTS.CENTER.x},${DEFAULTS.CENTER.y}`)
			)
	};
})();

export const scale = (() => {
	const { subscribe, set } = tweened(DEFAULTS.SCALE, { duration: 500, easing: cubicOut });

	return {
		subscribe,
		set: (value: number) => {
			set(value, { duration: 0 });
			setQp(KEYS.SCALE, String(value));
		},
		reset: () => set(DEFAULTS.SCALE).then(() => setQp(KEYS.SCALE, String(DEFAULTS.SCALE)))
	};
})();

/**
 * Colors
 */
type ValueOf<T> = T[keyof T];
export const makeColorStore = (
	_initValue: string | [number, number, number],
	key: ValueOf<typeof KEYS>
) => {
	const initialValue = typeof _initValue === 'string' ? hexToVec3(_initValue) : _initValue;

	const { subscribe, set } = tweened(initialValue, {
		duration: 500,
		easing: cubicOut
	});

	return {
		subscribe: subscribe,
		set: (hexValue: string) => {
			set(hexToVec3(hexValue), { duration: 0 });
			setQp(key, hexValue);
		},
		reset: () => set(initialValue).then(() => setQp(key, vec3ToHex(initialValue)))
	};
};

export const boundColor = makeColorStore(DEFAULTS.BOUND_COLOR, KEYS.BOUND_COLOR);
export const transitionColor = makeColorStore(DEFAULTS.TRANS_COLOR, KEYS.TRANS_COLOR);
export const escapeColor = makeColorStore(DEFAULTS.ESCAPE_COLOR, KEYS.ESCAPE_COLOR);

/**
 * Restoring state from QP
 * 	- Validate with ZOD, don't want any reflection shenanigans
 * 	- Parse query params, and set store values accordingly.
 */
const hexRegex = /^#[A-Fa-f0-9]{6}$/;
const colorScheme = (defaultVal: string) =>
	z.string().regex(hexRegex).optional().default(defaultVal);
const qpSchema = z.object({
	[KEYS.ITERATIONS]: z
		.preprocess(Number, z.number().min(1).max(500))
		.optional()
		.default(DEFAULTS.ITERATIONS),
	[KEYS.CENTER]: preprocess(
		(val: string) => {
			const p = val.match(/^(?<x>-?\d+(\.\d+)?),(?<y>-?\d+(\.\d+)?)$/)?.groups || {};

			return Object.entries(p).reduce((acc, [key, val]) => {
				acc[key] = Number(val);
				return acc;
			}, {});
		},
		z.object({
			x: z.number(),
			y: z.number()
		})
	)
		.optional()
		.default(DEFAULTS.CENTER),
	[KEYS.SCALE]: preprocess(Number, z.number().min(0.1)).optional().default(DEFAULTS.SCALE),
	[KEYS.BOUND_COLOR]: colorScheme(DEFAULTS.BOUND_COLOR),
	[KEYS.TRANS_COLOR]: colorScheme(DEFAULTS.TRANS_COLOR),
	[KEYS.ESCAPE_COLOR]: colorScheme(DEFAULTS.ESCAPE_COLOR)
});

export const hydrateStateFromURL = () => {
	const obj = {};
	for (const [key, value] of qp) {
		obj[key] = value;
	}

	try {
		const parsed = qpSchema.parse(obj);

		iterations.set(parsed.iterations);
		center.set(parsed.center as Required<typeof parsed.center>);
		scale.set(parsed.scale);
		boundColor.set(parsed.boundColor);
		transitionColor.set(parsed.transitionColor);
		escapeColor.set(parsed.escapeColor);
	} catch (e) {}
};
