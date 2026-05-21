import { Router } from "express";
import { taoSinhVienHandler, laySinhVienHandler, uploadAvatarHandler, } from "../controllers/sinhvien.controller.js";
import { avatarUpload } from "../middleware/upload.middleware.js";
const router = Router();
router.post("/", taoSinhVienHandler);
router.get("/:id", laySinhVienHandler);
router.post("/:maSinhVien/avatar", avatarUpload.single("avatar"), uploadAvatarHandler);
export default router;
