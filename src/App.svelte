<script lang="ts">
	import Controls from './components/Controls.svelte';
	import FractalDisplay from './components/FractalDisplay.svelte';
</script>

<div class="fixed inset-0">
	<div class="absolute inset-0">
		<FractalDisplay />
	</div>

	<div class="absolute right-0 top-0 p-5">
		<Controls />
	</div>
</div>
