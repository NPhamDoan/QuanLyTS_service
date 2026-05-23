import { getDb } from "./client.js";
import { runWithErrorMap } from "./error-map.js";
import { logQuery, logQueryError } from "../../logger.js";
import { NotFoundError } from "../../domain/errors.js";
const PUBLIC_COLS = "id, tenDangNhap, hoTen, vaiTro, trangThai, ngayTao, ngayCapNhat";
export class SqliteTaiKhoanRepository {
    async findAll() {
        logQuery("SqliteTaiKhoanRepository", "findAll", {});
        try {
            return getDb()
                .prepare(`SELECT ${PUBLIC_COLS} FROM TaiKhoan`)
                .all();
        }
        catch (err) {
            logQueryError("SqliteTaiKhoanRepository", "findAll", err);
            throw err;
        }
    }
    async findById(id) {
        logQuery("SqliteTaiKhoanRepository", "findById", { id });
        try {
            const row = getDb()
                .prepare("SELECT * FROM TaiKhoan WHERE id = ?")
                .get(id);
            return row ?? null;
        }
        catch (err) {
            logQueryError("SqliteTaiKhoanRepository", "findById", err);
            throw err;
        }
    }
    async findByTenDangNhap(tenDangNhap) {
        logQuery("SqliteTaiKhoanRepository", "findByTenDangNhap", { tenDangNhap });
        try {
            const row = getDb()
                .prepare("SELECT * FROM TaiKhoan WHERE tenDangNhap = ?")
                .get(tenDangNhap);
            return row ?? null;
        }
        catch (err) {
            logQueryError("SqliteTaiKhoanRepository", "findByTenDangNhap", err);
            throw err;
        }
    }
    async count() {
        logQuery("SqliteTaiKhoanRepository", "count", {});
        try {
            const row = getDb()
                .prepare("SELECT COUNT(*) as count FROM TaiKhoan")
                .get();
            return row.count;
        }
        catch (err) {
            logQueryError("SqliteTaiKhoanRepository", "count", err);
            throw err;
        }
    }
    async create(data) {
        logQuery("SqliteTaiKhoanRepository", "create", { data });
        try {
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
        catch (err) {
            logQueryError("SqliteTaiKhoanRepository", "create", err);
            throw err;
        }
    }
    async update(id, data) {
        logQuery("SqliteTaiKhoanRepository", "update", { id, data });
        try {
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
        catch (err) {
            logQueryError("SqliteTaiKhoanRepository", "update", err);
            throw err;
        }
    }
    async updateMatKhau(id, matKhauHash) {
        logQuery("SqliteTaiKhoanRepository", "updateMatKhau", { id, matKhauHash });
        try {
            const existing = await this.findById(id);
            if (!existing)
                throw new NotFoundError("tài khoản");
            const now = new Date().toISOString();
            getDb()
                .prepare("UPDATE TaiKhoan SET matKhauHash = ?, ngayCapNhat = ? WHERE id = ?")
                .run(matKhauHash, now, id);
        }
        catch (err) {
            logQueryError("SqliteTaiKhoanRepository", "updateMatKhau", err);
            throw err;
        }
    }
    async updateTrangThai(id, trangThai) {
        logQuery("SqliteTaiKhoanRepository", "updateTrangThai", { id, trangThai });
        try {
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
        catch (err) {
            logQueryError("SqliteTaiKhoanRepository", "updateTrangThai", err);
            throw err;
        }
    }
}
