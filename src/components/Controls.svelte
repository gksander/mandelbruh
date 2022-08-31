<script lang="ts">
	import { iterations, center, scale, boundColor, transitionColor, escapeColor } from '../stores';
	import ColorPicker from './ColorPicker.svelte';

	const onReset = () => {
		[scale, center, iterations, boundColor, transitionColor, escapeColor].forEach((x) => x.reset());
	};
</script>

<div class="bg-white dark:bg-gray-700 rounded-md shadow-lg w-64 overflow-hidden">
	<div class="grid gap-3 p-3">
		<h1 class="text-3xl text-gray-700 dark:text-gray-300">Mandelbruh</h1>

		<div class="prose text-sm text-gray-700 leading-snug dark:text-gray-100">
			Click and drag to pan. Scroll to zoom. Use controls below to adjust iterations/colors.
		</div>

		<div>
			<label
				for="iterations"
				class="block mb-1 text-sm font-medium text-gray-900 dark:text-gray-300"
				>Iterations ({Math.round($iterations)})</label
			>
			<input
				id="iterations"
				type="range"
				min="10"
				max="600"
				step="2"
				bind:value={$iterations}
				class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600"
			/>
		</div>

		<div>
			<ColorPicker color={boundColor} description="Bound color" />
			<ColorPicker color={transitionColor} description="Transition color" />
			<ColorPicker color={escapeColor} description="Escape color" />
		</div>

		<button
			on:click={onReset}
			class="text-sm rounded border dark:border-gray-500 px-3 py-1.5 bg-white dark:bg-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
			>Reset</button
		>
	</div>

	<div class="border-t flex text-xs font-medium dark:text-gray-200">
		<a
			href="https://github.com/gksander"
			target="_blank"
			rel="noreferrer"
			class="flex-1 text-center border-r p-3 cursor-pointer bg:white hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-150"
			>@gksander</a
		>
		<a
			href="https://github.com/gksander/mandelbruh"
			target="_blank"
			rel="noreferrer"
			class="flex-1 text-center p-3 cursor-pointer bg:white hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-150"
			>GitHub</a
		>
	</div>
</div>
