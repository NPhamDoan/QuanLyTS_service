import { getDb } from "./client.js";
export class SqliteRefreshTokenRepository {
    async create(taiKhoanId, tokenHash, hetHan) {
        const ngayTao = new Date().toISOString();
        getDb()
            .prepare("INSERT INTO RefreshToken (taiKhoanId, tokenHash, hetHan, ngayTao) VALUES (?, ?, ?, ?)")
            .run(taiKhoanId, tokenHash, hetHan, ngayTao);
    }
    async findByHash(tokenHash) {
        const row = getDb()
            .prepare(`SELECT rt.id, rt.taiKhoanId, rt.tokenHash, rt.hetHan, rt.ngayTao,
                tk.tenDangNhap, tk.hoTen, tk.vaiTro, tk.trangThai AS trangThaiTaiKhoan
         FROM RefreshToken rt JOIN TaiKhoan tk ON rt.taiKhoanId = tk.id
         WHERE rt.tokenHash = ?`)
            .get(tokenHash);
        return row ?? null;
    }
    async deleteById(id) {
        getDb().prepare("DELETE FROM RefreshToken WHERE id = ?").run(id);
    }
    async deleteByHash(tokenHash) {
        getDb()
            .prepare("DELETE FROM RefreshToken WHERE tokenHash = ?")
            .run(tokenHash);
    }
    async deleteAllByTaiKhoanId(taiKhoanId) {
        getDb()
            .prepare("DELETE FROM RefreshToken WHERE taiKhoanId = ?")
            .run(taiKhoanId);
    }
}
