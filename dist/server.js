import "dotenv/config";
import app from "./app.js";
import { ensureAdminAccount } from "./bootstrap.js";
const PORT = Number(process.env.PORT) || 3000;
async function start() {
    await ensureAdminAccount();
    app.listen(PORT, () => {
        console.log(`Server đang chạy tại port ${PORT} (DB: ${process.env.DB_TYPE || "sqlite"})`);
    });
}
start().catch((err) => {
    console.error("[server] Khởi động thất bại:", err);
    process.exit(1);
});
