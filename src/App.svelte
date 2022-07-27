<script lang="ts">
	import { onMount } from 'svelte';
	import fsSource from './shaders/fs.frag';
	import vsSource from './shaders/vs.frag';

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
		resolution: null as WebGLUniformLocation | null
	};

	// Options for rendering

	let zoomScale = 1;
	let iterations = 50;
	let center = { x: 0.25, y: 0.1 };
	let centerDelta = { x: 0, y: 0 };
	const mouseCoords = { x: width / 2, y: height / 2 };

	// Interactions
	let mouseDownStartPos = null as { x: number; y: number } | null;

	const init = () => {
		canvas.width = width;
		canvas.height = height;

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

	const render = () => {
		if (!gl) return;

		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		gl.useProgram(currentProgram);

		gl.uniform1f(locations.resolution, width);
		gl.uniform1i(locations.iterations, iterations);
		gl.uniform1f(locations.scale, zoomScale);
		gl.uniform2f(locations.center, center.x + centerDelta.x, center.y + centerDelta.y);

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
		measure();
		render();
		requestAnimationFrame(animate);
	};

	const onPointerDown = (e: MouseEvent) => {
		mouseDownStartPos = { x: e.offsetX, y: e.offsetY };
	};

	const onPointerMove = (e: MouseEvent) => {
		if (!mouseDownStartPos) return;

		centerDelta.x = -(e.offsetX - mouseDownStartPos.x) / (width * zoomScale);
		centerDelta.y = (e.offsetY - mouseDownStartPos.y) / (width * zoomScale);
	};

	const onPointerUp = () => {
		mouseDownStartPos = null;

		center.x += centerDelta.x;
		center.y += centerDelta.y;
		centerDelta.x = 0;
		centerDelta.y = 0;
	};

	const onPointerLeave = () => {
		onPointerUp();
	};

	onMount(() => {
		init();
		animate();
	});
</script>

<div
	style="width: {width}px; height: {height}px; resize:auto; overflow:hidden;"
	on:resize={(e) => {
		console.log(e);
	}}
	bind:this={container}
>
	<canvas
		bind:this={canvas}
		on:mousedown={onPointerDown}
		on:mousemove={onPointerMove}
		on:mouseup={onPointerUp}
		on:pointerleave={onPointerLeave}
		on:wheel={(e) => {
			const newScale = zoomScale + -(zoomScale * e.deltaY) / 100;

			// NOTE: I feel good about these hit points!
			const px = e.offsetX / width;
			const x0 = center.x + px / zoomScale;

			const py = (height - e.offsetY) / height;
			const y0 = center.y + (py * (height / width)) / zoomScale;

			// NOTE: I don't feel confident that this math is right.
			const s = newScale / zoomScale;
			center.x = (1 - s) * px;
			// center.y += (1 - newScale) * y0;

			zoomScale = newScale;
		}}
		on:click={(e) => {
			// Trying to find proper hit point in GL coords
			const px = e.offsetX / width;
			const x0 = center.x + px / zoomScale;

			const py = (height - e.offsetY) / height;
			const y0 = center.y + (py * (height / width)) / zoomScale;

			console.log(x0, y0);
			// 🎉 This looks good.
		}}
	/>
</div>

<div>
	<label for="iterations" class="text-gray-800">Iterations</label>
	<input name="iterations" type="range" min="10" max="160" step="2" bind:value={iterations} />
</div>

<button
	on:click={() => {
		zoomScale = 1;
		center = { x: 0, y: 0 };
	}}>Reset</button
>

<div>
	Center: ({center.x}, {center.y})
</div>
