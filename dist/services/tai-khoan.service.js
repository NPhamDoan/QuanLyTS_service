import bcryptjs from "bcryptjs";
import { repos } from "../repositories/index.js";
import { ForbiddenError, NotFoundError, ValidationError, } from "../domain/errors.js";
export const layDanhSach = () => repos.taiKhoan.findAll();
export const taoTaiKhoan = async (data) => {
    const matKhauHash = bcryptjs.hashSync(data.matKhau, 10);
    return repos.taiKhoan.create({
        tenDangNhap: data.tenDangNhap,
        matKhauHash,
        hoTen: data.hoTen,
        vaiTro: data.vaiTro,
    });
};
export const capNhatTaiKhoan = async (id, data, currentUserId) => {
    const existing = await repos.taiKhoan.findById(id);
    if (!existing)
        throw new NotFoundError("tài khoản");
    // Ngăn admin tự đổi vai trò của mình sang staff
    if (id === currentUserId &&
        data.vaiTro === "staff" &&
        existing.vaiTro === "admin") {
        throw new ForbiddenError("Không thể đổi vai trò của chính mình");
    }
    const roleChanged = data.vaiTro !== undefined && data.vaiTro !== existing.vaiTro;
    const updated = await repos.taiKhoan.update(id, data);
    // Nếu đổi vai trò, xóa toàn bộ refresh tokens của user đó để buộc đăng nhập lại
    if (roleChanged) {
        await repos.refreshToken.deleteAllByTaiKhoanId(id);
    }
    return updated;
};
export const datLaiMatKhau = async (id, matKhauMoi) => {
    if (!matKhauMoi || matKhauMoi.length < 6) {
        throw new ValidationError("Mật khẩu phải có ít nhất 6 ký tự");
    }
    const matKhauHash = bcryptjs.hashSync(matKhauMoi, 10);
    await repos.taiKhoan.updateMatKhau(id, matKhauHash);
    // Xóa toàn bộ refresh token → buộc đăng nhập lại với mật khẩu mới
    await repos.refreshToken.deleteAllByTaiKhoanId(id);
    return { message: "Đặt lại mật khẩu thành công" };
};
export const capNhatTrangThai = async (id, trangThai, currentUserId) => {
    if (trangThai === "vo_hieu_hoa" && id === currentUserId) {
        throw new ValidationError("Không thể vô hiệu hóa tài khoản của chính mình");
    }
    const updated = await repos.taiKhoan.updateTrangThai(id, trangThai);
    // Vô hiệu hóa → xóa toàn bộ refresh tokens
    if (trangThai === "vo_hieu_hoa") {
        await repos.refreshToken.deleteAllByTaiKhoanId(id);
    }
    return updated;
};
