<script lang="ts">
	import { add, magnitude, square, type Complex } from '../complex';

	import { onMount } from 'svelte';

	const MAX_ITERATIONS = 80;
	const RE_INT = { start: -1, end: 1 };
	const IM_INT = { start: -0.6, end: 0.6 };

	const width = 500;
	const height = 300;
	let canvas: HTMLCanvasElement;

	const ZOOM_AMOUNT = 1.5;

	const mandelbrot = (c: Complex) => {
		let z: Complex = { re: 0, im: 0 },
			d = 0,
			n = 0;

		do {
			z = add(square(z), c);
			d = magnitude(z);
			n++;
		} while (d <= 2 && n < MAX_ITERATIONS);

		return [n, d <= 2] as const;
	};

	const draw = () => {
		const ctx = canvas.getContext('2d');
		if (ctx) {
			ctx.canvas.width = width;
			ctx.canvas.height = height;

			for (let i = 0; i < width; i++) {
				for (let j = 0; j < height; j++) {
					const c: Complex = {
						re: RE_INT.start + (i / width) * (RE_INT.end - RE_INT.start),
						im: IM_INT.start + (j / height) * (IM_INT.end - IM_INT.start)
					};

					const [n, hasEscaped] = mandelbrot(c);

					ctx.fillStyle = hasEscaped ? '#000' : '#f0f';
					ctx.fillRect(i, j, 1, 1);
				}
			}
		}
	};

	const zoom = (offsetX: number, offsetY: number) => {
		const newDx = (RE_INT.end - RE_INT.start) / ZOOM_AMOUNT;
		const newDy = (IM_INT.end - IM_INT.start) / ZOOM_AMOUNT;

		// Where in
		const hitRE = RE_INT.start + (offsetX / width) * (RE_INT.end - RE_INT.start);
		const hitIM = IM_INT.start + (offsetY / height) * (IM_INT.end - IM_INT.start);

		const hitRePercent = (hitRE - RE_INT.start) / (RE_INT.end - RE_INT.start);
		const hitImPercent = (hitIM - IM_INT.start) / (IM_INT.end - IM_INT.start);

		RE_INT.start = hitRE - hitRePercent * newDx;
		RE_INT.end = RE_INT.start + newDx;
		IM_INT.start = hitIM - hitImPercent * newDy;
		IM_INT.end = IM_INT.start + newDy;

		draw();
	};

	onMount(draw);
</script>

<div style="width: {width}px; height: {height}px">
	<canvas
		bind:this={canvas}
		on:click={(e) => {
			zoom(e.offsetX, e.offsetY);
		}}
	/>
</div>
