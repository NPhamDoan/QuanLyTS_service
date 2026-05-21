import { layDanhSach, taoTaiKhoan, capNhatTaiKhoan, capNhatTrangThai, datLaiMatKhau, } from "../services/tai-khoan.service.js";
import { toHttpStatus } from "../domain/errors.js";
function sendError(res, err, fallback) {
    const { status, message } = toHttpStatus(err);
    res.status(status).json({ error: message || fallback });
}
export const layDanhSachHandler = async (_req, res) => {
    try {
        res.json(await layDanhSach());
    }
    catch (err) {
        sendError(res, err, "Lỗi lấy danh sách tài khoản");
    }
};
export const taoTaiKhoanHandler = async (req, res) => {
    try {
        res.status(201).json(await taoTaiKhoan(req.body));
    }
    catch (err) {
        sendError(res, err, "Lỗi tạo tài khoản");
    }
};
export const capNhatTaiKhoanHandler = async (req, res) => {
    try {
        const id = Number(req.params.id);
        res.json(await capNhatTaiKhoan(id, req.body, req.user.id));
    }
    catch (err) {
        sendError(res, err, "Lỗi cập nhật tài khoản");
    }
};
export const datLaiMatKhauHandler = async (req, res) => {
    try {
        const id = Number(req.params.id);
        res.json(await datLaiMatKhau(id, req.body.matKhauMoi));
    }
    catch (err) {
        sendError(res, err, "Lỗi đặt lại mật khẩu");
    }
};
export const capNhatTrangThaiHandler = async (req, res) => {
    try {
        const id = Number(req.params.id);
        res.json(await capNhatTrangThai(id, req.body.trangThai, req.user.id));
    }
    catch (err) {
        sendError(res, err, "Lỗi cập nhật trạng thái tài khoản");
    }
};
