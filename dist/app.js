import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { httpLogger, logger } from "./logger.js";
import { authMiddleware } from "./middleware/auth.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import taiKhoanRoutes from "./routes/admin/tai-khoan.routes.js";
import danhMucAdminRoutes from "./routes/admin/danh-muc.routes.js";
import danhMucPublicRoutes from "./routes/danhmuc.routes.js";
import sinhVienRoutes from "./routes/sinhvien.routes.js";
import hoSoRoutes from "./routes/hosotuyensinh.routes.js";
import tepDinhKemRoutes from "./routes/tepdinhkem.routes.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
// HTTP request logging — mount đầu tiên để bắt mọi request (kể cả khi cors/json
// gặp lỗi). pino-http sẽ gắn `req.id` và `req.log` (child logger có requestId).
app.use(httpLogger);
app.use(cors());
app.use(express.json());
// Serve only public uploads statically (avatars, etc.)
app.use("/uploads/public", express.static(path.join(__dirname, "..", "uploads", "public")));
// Auth routes (login/refresh are public, logout/me have their own middleware)
app.use("/auth", authRoutes);
// Public catalog routes (authMiddleware applied via router.use inside)
app.use("/danh-muc", danhMucPublicRoutes);
// Admin routes (auth + admin middleware applied via router.use inside)
app.use("/admin/tai-khoan", taiKhoanRoutes);
app.use("/admin", danhMucAdminRoutes);
// Existing routes — now require authentication
app.use("/sinhvien", authMiddleware, sinhVienRoutes);
app.use("/ho-so", authMiddleware, hoSoRoutes);
app.use("/tep-dinh-kem", authMiddleware, tepDinhKemRoutes);
// Serve frontend static files (production)
const frontendPath = path.join(__dirname, "..", "public");
app.use(express.static(frontendPath));
// SPA fallback — mọi route không match API sẽ trả về index.html
app.get("*", (_req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
});
// Error middleware — phải đặt cuối chuỗi và có chữ ký 4 tham số để Express
// nhận diện là error handler. Ưu tiên `req.log` (child logger có requestId);
// nếu không có thì fallback về `logger` toàn cục.
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
export default app;
