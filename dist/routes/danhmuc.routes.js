import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { namTuyenSinh, dotTuyenSinh, nganhDangKy, heDaoTao, } from "../services/danh-muc.service.js";
const router = Router();
router.use(authMiddleware);
router.get("/nam-tuyen-sinh", async (_req, res) => {
    try {
        res.json(await namTuyenSinh.findAllActive());
    }
    catch {
        res.status(500).json({ error: "Lỗi server" });
    }
});
router.get("/dot-tuyen-sinh", async (_req, res) => {
    try {
        res.json(await dotTuyenSinh.findAllActive());
    }
    catch {
        res.status(500).json({ error: "Lỗi server" });
    }
});
router.get("/nganh-dang-ky", async (_req, res) => {
    try {
        res.json(await nganhDangKy.findAllActive());
    }
    catch {
        res.status(500).json({ error: "Lỗi server" });
    }
});
router.get("/he-dao-tao", async (_req, res) => {
    try {
        res.json(await heDaoTao.findAllActive());
    }
    catch {
        res.status(500).json({ error: "Lỗi server" });
    }
});
export default router;
