var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { browser } from '$app/environment';
var defaultToolSettings = {
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
export var toolSettings = $state(__assign({}, (browser
    ? JSON.parse(localStorage.getItem('tool-settings') || JSON.stringify(defaultToolSettings))
    : defaultToolSettings)));
$effect.root(function () {
    $effect(function () {
        if (browser) {
            localStorage.setItem('tool-settings', JSON.stringify(toolSettings));
        }
    });
});
//# sourceMappingURL=tool-settings.svelte.js.map