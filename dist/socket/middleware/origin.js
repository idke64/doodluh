export function originMiddleware(socket, next) {
    var referer = socket.handshake.headers.referer;
    if (!referer) {
        return next(new Error('Origin not allowed'));
    }
    try {
        var refererUrl = new URL(referer);
        var allowedUrl = new URL(process.env.APP_URL);
        if (refererUrl.origin !== allowedUrl.origin) {
            return next(new Error('Origin not allowed'));
        }
        next();
    }
    catch (error) {
        return next(new Error('Error parsing url'));
    }
}
//# sourceMappingURL=origin.js.map