import "dotenv/config";
import app from "./app.js";
import { ensureAdminAccount } from "./bootstrap.js";
import { logger } from "./logger.js";
const PORT = Number(process.env.PORT) || 3000;
process.on("uncaughtException", (err) => {
    logger.fatal({ err: { name: err.name, message: err.message, stack: err.stack } }, "uncaughtException");
    process.exit(1);
});
process.on("unhandledRejection", (reason) => {
    const err = reason instanceof Error ? reason : new Error(String(reason));
    logger.error({ err: { name: err.name, message: err.message, stack: err.stack } }, "unhandledRejection");
});
async function start() {
    await ensureAdminAccount();
    app.listen(PORT, () => {
        logger.info({ port: PORT, dbType: process.env.DB_TYPE || "sqlite" }, "server.started");
    });
}
start().catch((err) => {
    logger.fatal({ err: { name: err?.name, message: err?.message, stack: err?.stack } }, "server.startup_failed");
    process.exit(1);
});
