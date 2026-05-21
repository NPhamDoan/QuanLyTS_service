import { Router } from "express";
import { loginHandler, refreshHandler, logoutHandler, meHandler, } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { rateLimit } from "../middleware/rate-limit.middleware.js";
const router = Router();
// 10 lần đăng nhập thất bại/thành công trong 15 phút cho mỗi IP
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: "Quá nhiều lần đăng nhập, vui lòng thử lại sau 15 phút",
});
router.post("/login", loginLimiter, loginHandler);
router.post("/refresh", refreshHandler);
router.post("/logout", authMiddleware, logoutHandler);
router.get("/me", authMiddleware, meHandler);
export default router;
