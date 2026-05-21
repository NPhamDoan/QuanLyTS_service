/**
 * In-memory rate limiter theo IP. Phù hợp cho single-instance backend.
 * Nếu deploy multi-instance, nên thay bằng Redis-based solution.
 */
export function rateLimit(options) {
    const { windowMs, max, message = "Quá nhiều yêu cầu, vui lòng thử lại sau" } = options;
    const store = new Map();
    // Dọn dẹp entries hết hạn mỗi windowMs
    setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of store.entries()) {
            if (entry.resetAt <= now)
                store.delete(key);
        }
    }, windowMs).unref();
    return (req, res, next) => {
        const key = req.ip || req.socket.remoteAddress || "unknown";
        const now = Date.now();
        const entry = store.get(key);
        if (!entry || entry.resetAt <= now) {
            store.set(key, { count: 1, resetAt: now + windowMs });
            return next();
        }
        if (entry.count >= max) {
            const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
            res.setHeader("Retry-After", String(retryAfter));
            res.status(429).json({ error: message });
            return;
        }
        entry.count++;
        next();
    };
}
