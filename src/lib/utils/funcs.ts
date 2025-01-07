import type { TransportObject, Object } from '$lib/types';

export const getThemeAwareColor = (color: string, useContrast: boolean, theme: string): string => {
	if (useContrast) {
		return theme === 'dark' ? '#ffffff' : '#000000';
	}
	return color;
};

export const camelToTitleCase = (str: string): string => {
	return str.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
};

export const generateRandomColor = (skip: string[] = []): string => {
	const colors = [
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
	].filter((color) => !skip.includes(color));

	if (colors.length === 0) return '#000000';
	return colors[Math.floor(Math.random() * colors.length)];
};
export const objectToTransport = (object: Object): TransportObject => [
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
		object.style.children?.map(objectToTransport) ?? null,
		object.style.useContrastFill ?? null,
		object.style.points?.map((p) => [p.x, p.y]) ?? null,
		object.style.shape ?? null,
		object.style.fillColor ?? null,
		object.style.fillOpacity ?? null,
		object.style.fontSize ?? null,
		object.style.fontFamily ?? null,
		object.style.text ?? null,
		object.style.image ?? null
	]
];

export const transportToObject = (transport: TransportObject): Object => ({
	id: transport[0],
	type: transport[1] as Object['type'],
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
		children: transport[10][0]?.map(transportToObject) ?? undefined,
		useContrastFill: transport[10][1] ?? undefined,
		points: transport[10][2]?.map(([x, y]) => ({ x, y })) ?? undefined,
		shape: (transport[10][3] as Object['style']['shape']) ?? undefined,
		fillColor: transport[10][4] ?? undefined,
		fillOpacity: transport[10][5] ?? undefined,
		fontSize: transport[10][6] ?? undefined,
		fontFamily: transport[10][7] ?? undefined,
		text: transport[10][8] ?? undefined,
		image: transport[10][9] ?? undefined
	}
});

export const throttle = <T extends (...args: any[]) => void>(fn: T, delay: number) => {
	let lastCall = 0;
	let timeout: NodeJS.Timeout | null = null;

	return (...args: Parameters<T>) => {
		const now = Date.now();
		const timeSinceLastCall = now - lastCall;

		if (timeout) {
			clearTimeout(timeout);
			timeout = null;
		}

		if (timeSinceLastCall >= delay) {
			lastCall = now;
			fn(...args);
		} else {
			timeout = setTimeout(() => {
				lastCall = Date.now();
				fn(...args);
			}, delay - timeSinceLastCall);
		}
	};
};
