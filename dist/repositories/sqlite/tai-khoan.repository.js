import { getDb } from "./client.js";
import { runWithErrorMap } from "./error-map.js";
import { NotFoundError } from "../../domain/errors.js";
const PUBLIC_COLS = "id, tenDangNhap, hoTen, vaiTro, trangThai, ngayTao, ngayCapNhat";
export class SqliteTaiKhoanRepository {
    async findAll() {
        return getDb()
            .prepare(`SELECT ${PUBLIC_COLS} FROM TaiKhoan`)
            .all();
    }
    async findById(id) {
        const row = getDb()
            .prepare("SELECT * FROM TaiKhoan WHERE id = ?")
            .get(id);
        return row ?? null;
    }
    async findByTenDangNhap(tenDangNhap) {
        const row = getDb()
            .prepare("SELECT * FROM TaiKhoan WHERE tenDangNhap = ?")
            .get(tenDangNhap);
        return row ?? null;
    }
    async count() {
        const row = getDb()
            .prepare("SELECT COUNT(*) as count FROM TaiKhoan")
            .get();
        return row.count;
    }
    async create(data) {
        const now = new Date().toISOString();
        const result = runWithErrorMap(() => getDb()
            .prepare(`INSERT INTO TaiKhoan (tenDangNhap, matKhauHash, hoTen, vaiTro, trangThai, ngayTao, ngayCapNhat)
             VALUES (?, ?, ?, ?, 'hoat_dong', ?, ?)`)
            .run(data.tenDangNhap, data.matKhauHash, data.hoTen, data.vaiTro, now, now), { conflict: "Tên đăng nhập đã tồn tại" });
        return {
            id: Number(result.lastInsertRowid),
            tenDangNhap: data.tenDangNhap,
            hoTen: data.hoTen,
            vaiTro: data.vaiTro,
            trangThai: "hoat_dong",
            ngayTao: now,
            ngayCapNhat: now,
        };
    }
    async update(id, data) {
        const existing = await this.findById(id);
        if (!existing)
            throw new NotFoundError("tài khoản");
        const fields = [];
        const values = [];
        if (data.hoTen !== undefined) {
            fields.push("hoTen = ?");
            values.push(data.hoTen);
        }
        if (data.vaiTro !== undefined) {
            fields.push("vaiTro = ?");
            values.push(data.vaiTro);
        }
        if (fields.length > 0) {
            fields.push("ngayCapNhat = ?");
            values.push(new Date().toISOString());
            values.push(id);
            getDb()
                .prepare(`UPDATE TaiKhoan SET ${fields.join(", ")} WHERE id = ?`)
                .run(...values);
        }
        return getDb()
            .prepare(`SELECT ${PUBLIC_COLS} FROM TaiKhoan WHERE id = ?`)
            .get(id);
    }
    async updateMatKhau(id, matKhauHash) {
        const existing = await this.findById(id);
        if (!existing)
            throw new NotFoundError("tài khoản");
        const now = new Date().toISOString();
        getDb()
            .prepare("UPDATE TaiKhoan SET matKhauHash = ?, ngayCapNhat = ? WHERE id = ?")
            .run(matKhauHash, now, id);
    }
    async updateTrangThai(id, trangThai) {
        const existing = await this.findById(id);
        if (!existing)
            throw new NotFoundError("tài khoản");
        const now = new Date().toISOString();
        getDb()
            .prepare("UPDATE TaiKhoan SET trangThai = ?, ngayCapNhat = ? WHERE id = ?")
            .run(trangThai, now, id);
        return getDb()
            .prepare(`SELECT ${PUBLIC_COLS} FROM TaiKhoan WHERE id = ?`)
            .get(id);
    }
}
