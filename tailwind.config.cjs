const { purple } = require("tailwindcss/colors")

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				primary: purple
			}
		}
	},
	plugins: []
};
