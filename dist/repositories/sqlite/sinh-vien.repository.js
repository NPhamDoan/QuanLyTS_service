import { getDb } from "./client.js";
function generateMaSinhVien() {
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
        const row = getDb()
            .prepare("SELECT * FROM SinhVien WHERE maSinhVien = ?")
            .get(maSinhVien);
        return row ?? null;
    }
    async create(data) {
        const maSinhVien = generateMaSinhVien();
        const now = new Date().toISOString();
        getDb()
            .prepare(`INSERT INTO SinhVien (
           maSinhVien, hoTen, ngaySinh, gioiTinh, cccd, email, soDienThoai, diaChi, ngayTao, ngayCapNhat
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
            .run(maSinhVien, data.hoTen, data.ngaySinh, data.gioiTinh, data.cccd, data.email, data.soDienThoai, data.diaChi, now, now);
        return { maSinhVien, ...data, anhDaiDien: null, ngayTao: now, ngayCapNhat: now };
    }
    async updateAvatar(maSinhVien, anhDaiDien) {
        getDb()
            .prepare("UPDATE SinhVien SET anhDaiDien = ? WHERE maSinhVien = ?")
            .run(anhDaiDien, maSinhVien);
    }
}
