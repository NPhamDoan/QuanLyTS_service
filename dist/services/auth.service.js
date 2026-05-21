import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { repos } from "../repositories/index.js";
import { ForbiddenError, NotFoundError, UnauthorizedError, } from "../domain/errors.js";
export const JWT_SECRET = process.env.JWT_SECRET || "jwt-secret-key";
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_DAYS = 7;
if (!process.env.JWT_SECRET) {
    console.warn("[auth] WARNING: JWT_SECRET not set in environment — using hardcoded fallback. Do NOT use this in production.");
}
function hashRefreshToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
}
export const dangNhap = async (tenDangNhap, matKhau) => {
    const user = await repos.taiKhoan.findByTenDangNhap(tenDangNhap);
    if (!user || !bcryptjs.compareSync(matKhau, user.matKhauHash)) {
        throw new UnauthorizedError("Tên đăng nhập hoặc mật khẩu không đúng");
    }
    if (user.trangThai === "vo_hieu_hoa") {
        throw new ForbiddenError("Tài khoản đã bị vô hiệu hóa");
    }
    const payload = {
        id: user.id,
        tenDangNhap: user.tenDangNhap,
        hoTen: user.hoTen,
        vaiTro: user.vaiTro,
    };
    const accessToken = jwt.sign(payload, JWT_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRY,
    });
    const refreshToken = crypto.randomBytes(40).toString("hex");
    const refreshTokenHash = hashRefreshToken(refreshToken);
    const hetHan = new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000).toISOString();
    await repos.refreshToken.create(user.id, refreshTokenHash, hetHan);
    return {
        accessToken,
        refreshToken,
        user: payload,
    };
};
export const lamMoiToken = async (refreshToken) => {
    const tokenHash = hashRefreshToken(refreshToken);
    const row = await repos.refreshToken.findByHash(tokenHash);
    if (!row) {
        throw new UnauthorizedError("Refresh token không hợp lệ");
    }
    if (new Date(row.hetHan) < new Date()) {
        await repos.refreshToken.deleteById(row.id);
        throw new UnauthorizedError("Refresh token không hợp lệ");
    }
    if (row.trangThaiTaiKhoan === "vo_hieu_hoa") {
        throw new ForbiddenError("Tài khoản đã bị vô hiệu hóa");
    }
    const payload = {
        id: row.taiKhoanId,
        tenDangNhap: row.tenDangNhap,
        hoTen: row.hoTen,
        vaiTro: row.vaiTro,
    };
    const accessToken = jwt.sign(payload, JWT_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRY,
    });
    return { accessToken };
};
export const dangXuat = async (refreshToken) => {
    const tokenHash = hashRefreshToken(refreshToken);
    await repos.refreshToken.deleteByHash(tokenHash);
};
export const layThongTinUser = async (userId) => {
    const user = await repos.taiKhoan.findById(userId);
    if (!user)
        throw new NotFoundError("người dùng");
    const { matKhauHash: _, ...rest } = user;
    return rest;
};
