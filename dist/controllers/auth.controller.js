import { dangNhap, lamMoiToken, dangXuat, layThongTinUser, } from "../services/auth.service.js";
import { toHttpStatus } from "../domain/errors.js";
function sendError(res, err, fallback) {
    const { status, message } = toHttpStatus(err);
    res.status(status).json({ error: message || fallback });
}
export const loginHandler = async (req, res) => {
    try {
        const { tenDangNhap, matKhau } = req.body;
        res.json(await dangNhap(tenDangNhap, matKhau));
    }
    catch (err) {
        sendError(res, err, "Lỗi đăng nhập");
    }
};
export const refreshHandler = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        res.json(await lamMoiToken(refreshToken));
    }
    catch (err) {
        sendError(res, err, "Lỗi làm mới token");
    }
};
export const logoutHandler = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        await dangXuat(refreshToken);
        res.json({ message: "Đăng xuất thành công" });
    }
    catch (err) {
        sendError(res, err, "Lỗi đăng xuất");
    }
};
export const meHandler = async (req, res) => {
    try {
        res.json(await layThongTinUser(req.user.id));
    }
    catch (err) {
        sendError(res, err, "Lỗi lấy thông tin người dùng");
    }
};
