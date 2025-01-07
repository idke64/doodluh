import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';

export const theme: Writable<string> = writable(
	browser ? localStorage.getItem('theme') || 'system' : 'system'
);

theme.subscribe((value) => {
	if (browser) {
		localStorage.setItem('theme', value);
	}
});
