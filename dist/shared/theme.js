import { browser } from '$app/environment';
import { writable } from 'svelte/store';
export var theme = writable(browser ? localStorage.getItem('theme') || 'system' : 'system');
theme.subscribe(function (value) {
    if (browser) {
        localStorage.setItem('theme', value);
    }
});
//# sourceMappingURL=theme.js.map