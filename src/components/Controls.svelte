<script lang="ts">
	import { iterations, center, zoomScale, defaultColor, color1, color2 } from '../stores';
	import ColorPicker from './ColorPicker.svelte';

	const onReset = () => {
		[zoomScale, center, iterations, defaultColor, color1, color2].forEach((x) => x.reset());
	};
</script>

<div class="bg-white p-3 rounded shadow-lg">
	<h1 class="text-2xl text-gray-700 mb-2">Mandelbruh</h1>
	<div>
		<label for="iterations" class="text-gray-800">Iterations</label>
		<input name="iterations" type="range" min="10" max="160" step="2" bind:value={$iterations} />
	</div>

	<button on:click={onReset}>Reset</button>

	<ColorPicker color={defaultColor} />
	<ColorPicker color={color1} />
	<ColorPicker color={color2} />
</div>
