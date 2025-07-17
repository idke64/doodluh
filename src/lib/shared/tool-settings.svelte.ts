import { browser } from '$app/environment';
import type { ToolSettings } from '$lib/types';

const defaultToolSettings: ToolSettings = {
	pencil: {
		thickness: 20,
		color: '#000000',
		opacity: 100,
		useContrast: true
	},
	shapes: {
		shape: 'rectangle',
		thickness: 5,
		color: '#000000',
		fillColor: 'transparent',
		opacity: 100,
		fillOpacity: 100,
		useContrast: true,
		useContrastFill: true
	},
	line: {
		thickness: 5,
		color: '#000000',
		opacity: 100,
		useContrast: true
	},
	text: {
		fontSize: 16,
		thickness: 0,
		color: '#000000',
		fillColor: 'transparent',
		fillOpacity: 100,
		fontFamily: 'Arial',
		useContrast: true,
		useContrastFill: true,
		opacity: 100
	}
};

export let toolSettings = $state({
	...(browser
		? JSON.parse(localStorage.getItem('tool-settings') || JSON.stringify(defaultToolSettings))
		: defaultToolSettings)
});

$effect.root(() => {
	$effect(() => {
		if (browser) {
			localStorage.setItem('tool-settings', JSON.stringify(toolSettings));
		}
	});
});
