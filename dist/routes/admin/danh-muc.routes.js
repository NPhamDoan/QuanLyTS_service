import { Router } from "express";
import { layDanhSachNamTuyenSinhHandler, themNamTuyenSinhHandler, capNhatNamTuyenSinhHandler, xoaNamTuyenSinhHandler, layDanhSachDotTuyenSinhHandler, themDotTuyenSinhHandler, capNhatDotTuyenSinhHandler, xoaDotTuyenSinhHandler, layDanhSachNganhDangKyHandler, themNganhDangKyHandler, capNhatNganhDangKyHandler, xoaNganhDangKyHandler, layDanhSachHeDaoTaoHandler, themHeDaoTaoHandler, capNhatHeDaoTaoHandler, xoaHeDaoTaoHandler, } from "../../controllers/danh-muc.controller.js";
import { authMiddleware, adminMiddleware, } from "../../middleware/auth.middleware.js";
const router = Router();
router.use(authMiddleware);
router.use(adminMiddleware);
// NamTuyenSinh
router.get("/nam-tuyen-sinh", layDanhSachNamTuyenSinhHandler);
router.post("/nam-tuyen-sinh", themNamTuyenSinhHandler);
router.put("/nam-tuyen-sinh/:id", capNhatNamTuyenSinhHandler);
router.delete("/nam-tuyen-sinh/:id", xoaNamTuyenSinhHandler);
// DotTuyenSinh
router.get("/dot-tuyen-sinh", layDanhSachDotTuyenSinhHandler);
router.post("/dot-tuyen-sinh", themDotTuyenSinhHandler);
router.put("/dot-tuyen-sinh/:id", capNhatDotTuyenSinhHandler);
router.delete("/dot-tuyen-sinh/:id", xoaDotTuyenSinhHandler);
// NganhDangKy
router.get("/nganh-dang-ky", layDanhSachNganhDangKyHandler);
router.post("/nganh-dang-ky", themNganhDangKyHandler);
router.put("/nganh-dang-ky/:id", capNhatNganhDangKyHandler);
router.delete("/nganh-dang-ky/:id", xoaNganhDangKyHandler);
// HeDaoTao
router.get("/he-dao-tao", layDanhSachHeDaoTaoHandler);
router.post("/he-dao-tao", themHeDaoTaoHandler);
router.put("/he-dao-tao/:id", capNhatHeDaoTaoHandler);
router.delete("/he-dao-tao/:id", xoaHeDaoTaoHandler);
export default router;
