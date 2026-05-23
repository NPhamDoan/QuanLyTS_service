import express from "express";
import { createHttpLogger } from "../../logger.js";
import { makeIsolatedLogger } from "./capture.js";
/**
 * Tạo một Express app cô lập có mount `httpLogger` (cùng pattern như
 * `app.ts`) và một error middleware tương đương. Logger ghi vào capture
 * stream nên test có thể đọc lại từng record.
 *
 * Tùy chọn `routes` cho phép test gắn các handler riêng (echo, throw,...).
 */
export function makeHarnessApp(level = "info", routes = () => undefined) {
    const { logger, capture } = makeIsolatedLogger({ level, pretty: false });
    const httpLogger = createHttpLogger(logger);
    const app = express();
    app.use(httpLogger);
    app.use(express.json());
    routes(app);
    // Error middleware — chữ ký 4 tham số, trùng pattern app.ts
    app.use((err, req, res, _next) => {
        const log = req.log ?? logger;
        log.error({
            err: {
                name: err?.name,
                message: err?.message,
                stack: err?.stack,
            },
        }, "request.error");
        const status = typeof err?.status === "number" ? err.status : 500;
        res.status(status).json({ error: err?.message || "Lỗi máy chủ" });
    });
    return { app, logger, capture };
}
