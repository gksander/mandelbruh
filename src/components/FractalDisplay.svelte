<script lang="ts">
	import { onMount } from 'svelte';
	import {
		iterations,
		scale,
		center,
		boundColor,
		transitionColor,
		escapeColor,
		hydrateStateFromURL
	} from '../stores';
	import fsSource from '../shaders/fs.frag';
	import vsSource from '../shaders/vs.frag';

	let width = 500;
	let height = 300;
	let container: HTMLDivElement;
	let canvas: HTMLCanvasElement;

	// GL references
	let gl: WebGL2RenderingContext | null;
	let buffer: WebGLBuffer | null;
	let currentProgram: WebGLProgram;
	const locations = {
		iterations: null as WebGLUniformLocation | null,
		scale: null as WebGLUniformLocation | null,
		center: null as WebGLUniformLocation | null,
		resolution: null as WebGLUniformLocation | null,
		boundColor: null as WebGLUniformLocation | null,
		transitionColor: null as WebGLUniformLocation | null,
		escapeColor: null as WebGLUniformLocation | null
	};

	// Some local interaction state
	let centerDelta = { x: 0, y: 0 };
	let isResizing = false;
	let resizeTimeout;

	// Interactions
	let mouseDownStartPos = null as { x: number; y: number; ts: number } | null;

	const init = () => {
		gl ||= canvas?.getContext('webgl2');
		if (!gl) return;

		buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(
			gl.ARRAY_BUFFER,
			new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0]),
			gl.STATIC_DRAW
		);

		currentProgram = createProgram();
		locations.iterations = gl.getUniformLocation(currentProgram, 'iterations');
		locations.center = gl.getUniformLocation(currentProgram, 'center');
		locations.scale = gl.getUniformLocation(currentProgram, 'scale');
		locations.resolution = gl.getUniformLocation(currentProgram, 'resolution');
		locations.boundColor = gl.getUniformLocation(currentProgram, 'boundColor');
		locations.transitionColor = gl.getUniformLocation(currentProgram, 'transitionColor');
		locations.escapeColor = gl.getUniformLocation(currentProgram, 'escapeColor');

		gl.viewport(0, 0, width, height);
	};

	const createProgram = () => {
		if (!gl) throw 'GL context not initialized';

		const program = gl.createProgram();
		if (!program) throw 'Could not create program';

		const vs = createShader(vsSource, gl.VERTEX_SHADER);
		const fs = createShader(
			'#ifdef GL_ES\nprecision highp float;\n#endif\n\n' + fsSource,
			gl.FRAGMENT_SHADER
		);

		gl.attachShader(program, vs);
		gl.attachShader(program, fs);

		gl.deleteShader(vs);
		gl.deleteShader(fs);

		gl.linkProgram(program);

		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw 'Failed to create program';

		return program;
	};

	const createShader = (src: string, type: number) => {
		if (!gl) throw 'Could not create shader, gl context not available yet';

		const shader = gl.createShader(type);
		if (!shader) throw 'Could not create shader';

		gl.shaderSource(shader, src);
		gl.compileShader(shader);

		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
			throw `Shader creation failed for ${src}`;

		return shader;
	};

	// Dynamically set uniform locations when values change.
	$: if (gl) {
		gl.uniform1f(locations.resolution, width);
		gl.uniform1i(locations.iterations, Math.round($iterations));
		gl.uniform1f(locations.scale, $scale);
		gl.uniform2f(locations.center, $center.x + centerDelta.x, $center.y + centerDelta.y);
		gl.uniform3f(locations.boundColor, ...$boundColor);
		gl.uniform3f(locations.transitionColor, ...$transitionColor);
		gl.uniform3f(locations.escapeColor, ...$escapeColor);
	}

	const render = () => {
		if (!gl) return;

		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.useProgram(currentProgram);

		// Render geometry
		let vertex_position = 0;
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.vertexAttribPointer(vertex_position, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(vertex_position);
		gl.drawArrays(gl.TRIANGLES, 0, 6);
		gl.disableVertexAttribArray(vertex_position);
	};

	const measure = () => {
		if (width !== container.clientWidth || height !== container.clientHeight) {
			width = container.clientWidth;
			height = container.clientHeight;

			canvas.width = width;
			canvas.height = height;

			gl?.viewport?.(0, 0, width, height);
		}
	};

	const animate = () => {
		if (!isResizing) {
			measure();
			render();
		}
		requestAnimationFrame(animate);
	};

	const handlePointerDown = (e: MouseEvent) => {
		mouseDownStartPos = { x: e.offsetX, y: e.offsetY, ts: Date.now() };
	};

	const handlePointerMove = (e: MouseEvent | TouchEvent) => {
		if (!mouseDownStartPos) return;

		const offsetX = 'touches' in e ? e.touches[0].clientX : e.offsetX;
		const offsetY = 'touches' in e ? e.touches[0].clientY : e.offsetY;

		centerDelta.x = -(offsetX - mouseDownStartPos.x) / (width * $scale);
		centerDelta.y = (offsetY - mouseDownStartPos.y) / (width * $scale);
	};

	const handlePointerUp = () => {
		if (!mouseDownStartPos) return;

		$center.x += centerDelta.x;
		$center.y += centerDelta.y;
		centerDelta.x = 0;
		centerDelta.y = 0;

		mouseDownStartPos = null;
	};

	const handlePointerLeave = () => {
		handlePointerUp();
	};

	const handleWheel = (e: WheelEvent) => {
		const a_i = $scale;
		const a_f = a_i + -($scale * e.deltaY) / 100;

		const px = e.offsetX / width;
		const x0 = $center.x + px / a_i;

		const py = (height - e.offsetY) / height;
		const y0 = $center.y + (py * (height / width)) / a_i;

		$scale = a_f;
		$center.x = x0 - (a_i / a_f) * (x0 - $center.x);
		$center.y = y0 - (a_i / a_f) * (y0 - $center.y);
	};

	onMount(() => {
		hydrateStateFromURL();
		init();
		animate();
	});
</script>

<div class="w-full h-full" bind:this={container}>
	<canvas
		bind:this={canvas}
		on:mousedown|preventDefault|stopPropagation={handlePointerDown}
		on:mousemove|preventDefault|stopPropagation={handlePointerMove}
		on:mouseup|preventDefault|stopPropagation={handlePointerUp}
		on:mouseleave|preventDefault|stopPropagation={handlePointerLeave}
		on:pointerdown|preventDefault|stopPropagation={handlePointerDown}
		on:pointermove|preventDefault|stopPropagation={handlePointerMove}
		on:pointerup|preventDefault|stopPropagation={handlePointerUp}
		on:pointerleave|preventDefault|stopPropagation={handlePointerLeave}
		on:touchmove|preventDefault|stopPropagation={handlePointerMove}
		on:wheel|preventDefault|stopPropagation={handleWheel}
	/>
</div>

<!-- Throttle the RAF rendering when resizing window -->
<svelte:window
	on:resize={() => {
		isResizing = true;
		clearTimeout(resizeTimeout);
		resizeTimeout = setTimeout(() => {
			isResizing = false;
		}, 150);
	}}
/>
