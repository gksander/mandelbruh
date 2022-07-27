<script lang="ts">
	import type { makeColorStore } from '../stores';

	import { vec3ToHex } from '../utils/colors';

	export let color: ReturnType<typeof makeColorStore>;
	export let description: string = 'Color';
</script>

<label
	class="flex gap-2 items-center cursor-pointer px-1 py-1.5 hover:bg-gray-100 rounded transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
	tabindex="0"
>
	<input
		type="color"
		value={vec3ToHex($color)}
		on:input={(e) => {
			$color = e.target.value;
		}}
		class="w-8 h-6 rounded bg-gray-100"
	/>
	<div class="flex-grow text-sm font-medium text-gray-900">{description}</div>
</label>
