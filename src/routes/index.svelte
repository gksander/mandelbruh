<script lang="ts">
	import { onMount } from 'svelte';
	import fsSource from '../fs.frag';
	import vsSource from '../vs.frag';

	const RE_INT = [-1, 1];
	const IM_INT = [-0.6, 0.6];

	const width = 500;
	const height = 300;
	let canvas: HTMLCanvasElement;
	let gl: WebGL2RenderingContext | null;
	let buffer: WebGLBuffer | null;
	let currentProgram: WebGLProgram;

	const locations = {
		iterations: null as WebGLUniformLocation | null,
		scale: null as WebGLUniformLocation | null,
		center: null as WebGLUniformLocation | null,
		resolution: null as WebGLUniformLocation | null
		// time: null as WebGLUniformLocation | null,
		// resolution: null as WebGLUniformLocation | null,
		// insight: null as WebGLUniformLocation | null,
		// discSize: null as WebGLUniformLocation | null,
		// mouse: null as WebGLUniformLocation | null,
		// zoom: null as WebGLUniformLocation | null,
		// offset: null as WebGLUniformLocation | null,
		// iteration: null as WebGLUniformLocation | null,
		// juliaPos: null as WebGLUniformLocation | null
	};

	let zoomScale = 0.5;
	const mouseCoords = { x: width / 2, y: height / 2 };

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

		gl.uniform1f(locations.resolution, 2048);
		gl.uniform1i(locations.iterations, 50);
		gl.uniform1f(locations.scale, zoomScale);
		gl.uniform2f(locations.center, 0.0, 0.0);

		// Render geometry
		let vertex_position = 0;
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.vertexAttribPointer(vertex_position, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(vertex_position);
		gl.drawArrays(gl.TRIANGLES, 0, 6);
		gl.disableVertexAttribArray(vertex_position);
	};

	const animate = () => {
		render();
		requestAnimationFrame(animate);
	};

	onMount(() => {
		init();
		animate();
	});
</script>

<div style="width: {width}px; height: {height}px">
	<canvas
		bind:this={canvas}
		on:click={(e) => {
			zoomScale -= 0.05;
		}}
		on:mousemove={(e) => {
			mouseCoords.x = e.offsetX;
			mouseCoords.y = e.offsetY;
		}}
	/>

	<input type="range" min="0.5" max="2" step="0.002" bind:value={zoomScale} />

	<input type="number" bind:value={zoomScale} />
</div>
