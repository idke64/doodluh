export var getThemeAwareColor = function (color, useContrast, theme) {
    if (useContrast) {
        return theme === 'dark' ? '#ffffff' : '#000000';
    }
    return color;
};
export var camelToTitleCase = function (str) {
    return str.replace(/([A-Z])/g, ' $1').replace(/^./, function (s) { return s.toUpperCase(); });
};
export var generateRandomColor = function (skip) {
    if (skip === void 0) { skip = []; }
    var colors = [
        '#1E90FF',
        '#08085e',
        '#483D8B',
        '#7B68EE',
        '#8A2BE2',
        '#800080',
        '#DA70D6',
        '#B03060',
        '#d21e51',
        '#F08080',
        '#FF4520',
        '#FFA500',
        '#F4A460',
        '#F0E68C',
        '#808000',
        '#8B4513',
        '#9ACD32',
        '#7CFC00',
        '#8FBC8F',
        '#228B22',
        '#008B8B',
        '#808080'
    ].filter(function (color) { return !skip.includes(color); });
    if (colors.length === 0)
        return '#000000';
    return colors[Math.floor(Math.random() * colors.length)];
};
export var objectToTransport = function (object) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    return [
        object.id,
        object.type,
        [object.box.pos.x, object.box.pos.y, object.box.width, object.box.height, object.box.rotation],
        [object.start.x, object.start.y],
        [object.end.x, object.end.y],
        object.color,
        object.opacity,
        object.useContrast,
        object.thickness,
        object.zIndex,
        [
            (_b = (_a = object.style.children) === null || _a === void 0 ? void 0 : _a.map(objectToTransport)) !== null && _b !== void 0 ? _b : null,
            (_c = object.style.useContrastFill) !== null && _c !== void 0 ? _c : null,
            (_e = (_d = object.style.points) === null || _d === void 0 ? void 0 : _d.map(function (p) { return [p.x, p.y]; })) !== null && _e !== void 0 ? _e : null,
            (_f = object.style.shape) !== null && _f !== void 0 ? _f : null,
            (_g = object.style.fillColor) !== null && _g !== void 0 ? _g : null,
            (_h = object.style.fillOpacity) !== null && _h !== void 0 ? _h : null,
            (_j = object.style.fontSize) !== null && _j !== void 0 ? _j : null,
            (_k = object.style.fontFamily) !== null && _k !== void 0 ? _k : null,
            (_l = object.style.text) !== null && _l !== void 0 ? _l : null,
            (_m = object.style.image) !== null && _m !== void 0 ? _m : null
        ]
    ];
};
export var transportToObject = function (transport) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    return ({
        id: transport[0],
        type: transport[1],
        box: {
            pos: { x: transport[2][0], y: transport[2][1] },
            width: transport[2][2],
            height: transport[2][3],
            rotation: transport[2][4]
        },
        start: { x: transport[3][0], y: transport[3][1] },
        end: { x: transport[4][0], y: transport[4][1] },
        color: transport[5],
        opacity: transport[6],
        useContrast: transport[7],
        thickness: transport[8],
        zIndex: transport[9],
        style: {
            children: (_b = (_a = transport[10][0]) === null || _a === void 0 ? void 0 : _a.map(transportToObject)) !== null && _b !== void 0 ? _b : undefined,
            useContrastFill: (_c = transport[10][1]) !== null && _c !== void 0 ? _c : undefined,
            points: (_e = (_d = transport[10][2]) === null || _d === void 0 ? void 0 : _d.map(function (_a) {
                var x = _a[0], y = _a[1];
                return ({ x: x, y: y });
            })) !== null && _e !== void 0 ? _e : undefined,
            shape: (_f = transport[10][3]) !== null && _f !== void 0 ? _f : undefined,
            fillColor: (_g = transport[10][4]) !== null && _g !== void 0 ? _g : undefined,
            fillOpacity: (_h = transport[10][5]) !== null && _h !== void 0 ? _h : undefined,
            fontSize: (_j = transport[10][6]) !== null && _j !== void 0 ? _j : undefined,
            fontFamily: (_k = transport[10][7]) !== null && _k !== void 0 ? _k : undefined,
            text: (_l = transport[10][8]) !== null && _l !== void 0 ? _l : undefined,
            image: (_m = transport[10][9]) !== null && _m !== void 0 ? _m : undefined
        }
    });
};
export var throttle = function (fn, delay) {
    var lastCall = 0;
    var timeout = null;
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var now = Date.now();
        var timeSinceLastCall = now - lastCall;
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }
        if (timeSinceLastCall >= delay) {
            lastCall = now;
            fn.apply(void 0, args);
        }
        else {
            timeout = setTimeout(function () {
                lastCall = Date.now();
                fn.apply(void 0, args);
            }, delay - timeSinceLastCall);
        }
    };
};
//# sourceMappingURL=funcs.js.map