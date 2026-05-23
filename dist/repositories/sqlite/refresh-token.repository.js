import { getDb } from "./client.js";
import { logQuery, logQueryError } from "../../logger.js";
export class SqliteRefreshTokenRepository {
    async create(taiKhoanId, tokenHash, hetHan) {
        logQuery("SqliteRefreshTokenRepository", "create", {
            taiKhoanId,
            tokenHash,
            hetHan,
        });
        try {
            const ngayTao = new Date().toISOString();
            getDb()
                .prepare("INSERT INTO RefreshToken (taiKhoanId, tokenHash, hetHan, ngayTao) VALUES (?, ?, ?, ?)")
                .run(taiKhoanId, tokenHash, hetHan, ngayTao);
        }
        catch (err) {
            logQueryError("SqliteRefreshTokenRepository", "create", err);
            throw err;
        }
    }
    async findByHash(tokenHash) {
        logQuery("SqliteRefreshTokenRepository", "findByHash", { tokenHash });
        try {
            const row = getDb()
                .prepare(`SELECT rt.id, rt.taiKhoanId, rt.tokenHash, rt.hetHan, rt.ngayTao,
                tk.tenDangNhap, tk.hoTen, tk.vaiTro, tk.trangThai AS trangThaiTaiKhoan
         FROM RefreshToken rt JOIN TaiKhoan tk ON rt.taiKhoanId = tk.id
         WHERE rt.tokenHash = ?`)
                .get(tokenHash);
            return row ?? null;
        }
        catch (err) {
            logQueryError("SqliteRefreshTokenRepository", "findByHash", err);
            throw err;
        }
    }
    async deleteById(id) {
        logQuery("SqliteRefreshTokenRepository", "deleteById", { id });
        try {
            getDb().prepare("DELETE FROM RefreshToken WHERE id = ?").run(id);
        }
        catch (err) {
            logQueryError("SqliteRefreshTokenRepository", "deleteById", err);
            throw err;
        }
    }
    async deleteByHash(tokenHash) {
        logQuery("SqliteRefreshTokenRepository", "deleteByHash", { tokenHash });
        try {
            getDb()
                .prepare("DELETE FROM RefreshToken WHERE tokenHash = ?")
                .run(tokenHash);
        }
        catch (err) {
            logQueryError("SqliteRefreshTokenRepository", "deleteByHash", err);
            throw err;
        }
    }
    async deleteAllByTaiKhoanId(taiKhoanId) {
        logQuery("SqliteRefreshTokenRepository", "deleteAllByTaiKhoanId", {
            taiKhoanId,
        });
        try {
            getDb()
                .prepare("DELETE FROM RefreshToken WHERE taiKhoanId = ?")
                .run(taiKhoanId);
        }
        catch (err) {
            logQueryError("SqliteRefreshTokenRepository", "deleteAllByTaiKhoanId", err);
            throw err;
        }
    }
}
