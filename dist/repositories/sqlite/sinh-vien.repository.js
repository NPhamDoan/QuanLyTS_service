import { getDb } from "./client.js";
import { logQuery, logQueryError } from "../../logger.js";
/**
 * Sinh mã sinh viên trong cùng transaction với INSERT để tránh race —
 * xem comment ở `ho-so.repository.ts` về lý do.
 */
function generateMaSinhVienInTx() {
    const year = new Date().getFullYear();
    const prefix = `SV-${year}`;
    const row = getDb()
        .prepare("SELECT maSinhVien FROM SinhVien WHERE maSinhVien LIKE ? ORDER BY maSinhVien DESC LIMIT 1")
        .get(`${prefix}%`);
    let seq = 1;
    if (row) {
        const lastSeq = parseInt(row.maSinhVien.slice(prefix.length), 10);
        if (!isNaN(lastSeq))
            seq = lastSeq + 1;
    }
    return `${prefix}${String(seq).padStart(4, "0")}`;
}
export class SqliteSinhVienRepository {
    async findById(maSinhVien) {
        logQuery("SqliteSinhVienRepository", "findById", { maSinhVien });
        try {
            const row = getDb()
                .prepare("SELECT * FROM SinhVien WHERE maSinhVien = ?")
                .get(maSinhVien);
            return row ?? null;
        }
        catch (err) {
            logQueryError("SqliteSinhVienRepository", "findById", err);
            throw err;
        }
    }
    async create(data) {
        logQuery("SqliteSinhVienRepository", "create", { data });
        try {
            const now = new Date().toISOString();
            const db = getDb();
            const runTx = db.transaction((input) => {
                const maSinhVien = generateMaSinhVienInTx();
                db.prepare(`INSERT INTO SinhVien (
             maSinhVien, hoTen, ngaySinh, gioiTinh, cccd, email, soDienThoai, diaChi, ngayTao, ngayCapNhat
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(maSinhVien, input.hoTen, input.ngaySinh, input.gioiTinh, input.cccd, input.email, input.soDienThoai, input.diaChi, now, now);
                return maSinhVien;
            });
            const maSinhVien = runTx(data);
            return {
                maSinhVien,
                ...data,
                anhDaiDien: null,
                ngayTao: now,
                ngayCapNhat: now,
            };
        }
        catch (err) {
            logQueryError("SqliteSinhVienRepository", "create", err);
            throw err;
        }
    }
    async updateAvatar(maSinhVien, anhDaiDien) {
        logQuery("SqliteSinhVienRepository", "updateAvatar", { maSinhVien, anhDaiDien });
        try {
            getDb()
                .prepare("UPDATE SinhVien SET anhDaiDien = ? WHERE maSinhVien = ?")
                .run(anhDaiDien, maSinhVien);
        }
        catch (err) {
            logQueryError("SqliteSinhVienRepository", "updateAvatar", err);
            throw err;
        }
    }
}
