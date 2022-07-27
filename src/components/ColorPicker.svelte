<script lang="ts">
	import type { makeColorStore } from '../stores';

	import { vec3ToHex } from '../utils/colors';

	export let color: ReturnType<typeof makeColorStore>;
</script>

<input
	type="color"
	value={vec3ToHex($color)}
	on:input={(e) => {
		$color = e.target.value;
	}}
/>
