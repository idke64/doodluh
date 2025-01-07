import { Socket } from 'socket.io';

export function originMiddleware(socket: Socket, next: Function) {
	const referer = socket.handshake.headers.referer;
	if (!referer) {
		return next(new Error('Origin not allowed'));
	}

	try {
		const refererUrl = new URL(referer);
		const allowedUrl = new URL(process.env.APP_URL!);

		if (refererUrl.origin !== allowedUrl.origin) {
			return next(new Error('Origin not allowed'));
		}
		next();
	} catch (error) {
		return next(new Error('Error parsing url'));
	}
}
