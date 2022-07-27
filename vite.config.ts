import { svelte } from '@sveltejs/vite-plugin-svelte';
import glsl from 'vite-plugin-glsl';

const config = {
	plugins: [svelte(), glsl()]
};

export default config;
