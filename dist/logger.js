import pino from "pino";
import pinoHttp from "pino-http";
export const VALID_LEVELS = [
    "trace",
    "debug",
    "info",
    "warn",
    "error",
    "fatal",
    "silent",
];
export function resolveLevel(raw) {
    return VALID_LEVELS.includes(raw) ? raw : "info";
}
// Đường dẫn các trường nhạy cảm cần che (xem MaskedField trong requirements):
// matKhau, matKhauHash, password, token, accessToken, refreshToken,
// authorization, cccd, email — ở top-level và trong req.headers / req.body /
// res.body / params (dùng cho logQuery).
export const REDACT_PATHS = [
    // top-level keys
    "matKhau",
    "matKhauHash",
    "password",
    "token",
    "accessToken",
    "refreshToken",
    "authorization",
    "cccd",
    "email",
    // request bindings (pino-http gắn key `req`)
    "req.headers.authorization",
    "req.headers.Authorization",
    "req.headers.cookie",
    "req.body.matKhau",
    "req.body.matKhauHash",
    "req.body.password",
    "req.body.token",
    "req.body.accessToken",
    "req.body.refreshToken",
    "req.body.cccd",
    "req.body.email",
    // response bindings (pino-http gắn key `res`)
    "res.headers.authorization",
    "res.body.accessToken",
    "res.body.refreshToken",
    "res.body.token",
    // generic params (dùng cho logQuery)
    "params.matKhau",
    "params.matKhauHash",
    "params.password",
    "params.token",
    "params.accessToken",
    "params.refreshToken",
    "params.cccd",
    "params.email",
    // nested params.data.* — repository thường log {data: {...}}
    "params.data.matKhau",
    "params.data.matKhauHash",
    "params.data.password",
    "params.data.token",
    "params.data.accessToken",
    "params.data.refreshToken",
    "params.data.cccd",
    "params.data.email",
    // nested req.body.data.* — giữ đối xứng với params.data.*
    "req.body.data.matKhau",
    "req.body.data.matKhauHash",
    "req.body.data.password",
    "req.body.data.token",
    "req.body.data.accessToken",
    "req.body.data.refreshToken",
    "req.body.data.cccd",
    "req.body.data.email",
    // pino-http customSuccessObject (level=trace) gắn body vào reqBody/resBody
    // ở top-level của record (xem `createHttpLogger`). Bao phủ MaskedField ở
    // trong các key đó.
    "reqBody.matKhau",
    "reqBody.matKhauHash",
    "reqBody.password",
    "reqBody.token",
    "reqBody.accessToken",
    "reqBody.refreshToken",
    "reqBody.cccd",
    "reqBody.email",
    "reqBody.data.matKhau",
    "reqBody.data.matKhauHash",
    "reqBody.data.password",
    "reqBody.data.token",
    "reqBody.data.accessToken",
    "reqBody.data.refreshToken",
    "reqBody.data.cccd",
    "reqBody.data.email",
    "resBody.accessToken",
    "resBody.refreshToken",
    "resBody.token",
];
/**
 * Factory tạo một pino logger mới. Dùng cho:
 * - Singleton mặc định (xem `logger` ở dưới).
 * - Test: truyền `destination` để capture output, và `level`/`pretty` để override env.
 *
 * Khi `destination` có mặt, transport `pino-pretty` bị bỏ qua (test cần JSON
 * raw để parse). Khi không có `destination`, hành vi như cũ:
 * `LOG_PRETTY=true` → bật `pino-pretty`, ngược lại JSON ra stdout.
 */
export function createLogger(opts = {}) {
    const lvl = resolveLevel(opts.level !== undefined ? opts.level : process.env.LOG_LEVEL);
    const isPretty = opts.pretty !== undefined
        ? opts.pretty
        : process.env.LOG_PRETTY === "true";
    const baseOptions = {
        level: lvl,
        redact: {
            paths: REDACT_PATHS,
            censor: "[REDACTED]",
            remove: false,
        },
    };
    if (opts.destination) {
        return pino(baseOptions, opts.destination);
    }
    if (isPretty) {
        return pino({
            ...baseOptions,
            transport: {
                target: "pino-pretty",
                options: {
                    colorize: true,
                    singleLine: false,
                    translateTime: "SYS:standard",
                },
            },
        });
    }
    return pino(baseOptions);
}
/**
 * Factory tạo `pino-http` middleware dùng chung một logger instance.
 * Chỉ bật serializers ghi `req.body` / `res.body` khi level = "trace".
 *
 * Lưu ý kỹ thuật: pino-http gắn `req` lên child bindings ngay khi request
 * đến — tại thời điểm đó Express body-parser CHƯA chạy, nên `req.body` =
 * undefined. Pino tiếp tục dùng cached chindings cho mọi log của request đó,
 * nên không thể đặt body vào key `req` (sẽ bị chindings-merge ghi đè).
 *
 * Giải pháp: với level = trace, expose body qua hai key riêng `reqBody` và
 * `resBody` thông qua `customSuccessObject` / `customErrorObject` (gọi tại
 * lúc response finish, sau khi handler đã chạy). Điều này thỏa Requirement
 * 2.4 (log body khi level=trace) mà không xung đột với pino chindings.
 */
export function createHttpLogger(baseLogger) {
    const lvl = baseLogger.level;
    if (lvl !== "trace") {
        // Bình thường: dùng config mặc định của pino-http (std serializers wrap).
        return pinoHttp({
            logger: baseLogger,
            customLogLevel: (_req, res, err) => {
                if (err || res.statusCode >= 500)
                    return "error";
                if (res.statusCode >= 400)
                    return "warn";
                return "info";
            },
        });
    }
    return pinoHttp({
        logger: baseLogger,
        customLogLevel: (_req, res, err) => {
            if (err || res.statusCode >= 500)
                return "error";
            if (res.statusCode >= 400)
                return "warn";
            return "info";
        },
        customSuccessObject: (req, res, baseObj) => ({
            ...baseObj,
            reqBody: req.body,
            resBody: res.body,
        }),
        customErrorObject: (req, res, _err, baseObj) => ({
            ...baseObj,
            reqBody: req.body,
            resBody: res.body,
        }),
    });
}
export const logger = createLogger();
export const httpLogger = createHttpLogger(logger);
/**
 * Ghi log truy vấn DB ở mức debug. Pino tự lọc theo level: nếu LOG_LEVEL >
 * debug, call này không sinh output.
 *
 * Tham số `targetLogger` cho phép test truyền logger riêng (capture stream).
 * Mặc định dùng singleton `logger`.
 */
export function logQuery(repo, op, params, targetLogger = logger) {
    targetLogger.debug({ repo, op, params }, "db.query");
}
/**
 * Ghi log lỗi truy vấn DB ở mức error, kèm name/message/stack.
 * Tham số `targetLogger` cho phép test truyền logger riêng.
 */
export function logQueryError(repo, op, err, targetLogger = logger) {
    const e = err instanceof Error ? err : new Error(String(err));
    targetLogger.error({ repo, op, err: { name: e.name, message: e.message, stack: e.stack } }, "db.query.error");
}
