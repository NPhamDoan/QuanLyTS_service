import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
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
export default app;
