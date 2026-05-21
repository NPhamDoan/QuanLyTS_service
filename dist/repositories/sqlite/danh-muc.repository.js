import { getDb } from "./client.js";
import { runWithErrorMap } from "./error-map.js";
import { NotFoundError } from "../../domain/errors.js";
// ============================================
// NamTuyenSinh
// ============================================
export class SqliteNamTuyenSinhRepository {
    async findAll() {
        return getDb()
            .prepare("SELECT * FROM NamTuyenSinh ORDER BY nam DESC")
            .all();
    }
    async findAllActive() {
        return getDb()
            .prepare("SELECT * FROM NamTuyenSinh WHERE trangThai = 'hoat_dong' ORDER BY nam DESC")
            .all();
    }
    async findById(id) {
        const row = getDb()
            .prepare("SELECT * FROM NamTuyenSinh WHERE id = ?")
            .get(id);
        return row ?? null;
    }
    async create(data) {
        const now = new Date().toISOString();
        const result = runWithErrorMap(() => getDb()
            .prepare("INSERT INTO NamTuyenSinh (nam, trangThai, ngayTao, ngayCapNhat) VALUES (?, ?, ?, ?)")
            .run(data.nam, data.trangThai || "hoat_dong", now, now), { conflict: "Năm tuyển sinh đã tồn tại" });
        return (await this.findById(Number(result.lastInsertRowid)));
    }
    async update(id, data) {
        const existing = await this.findById(id);
        if (!existing)
            throw new NotFoundError("năm tuyển sinh");
        const fields = [];
        const values = [];
        if (data.nam !== undefined) {
            fields.push("nam = ?");
            values.push(data.nam);
        }
        if (data.trangThai !== undefined) {
            fields.push("trangThai = ?");
            values.push(data.trangThai);
        }
        if (fields.length > 0) {
            fields.push("ngayCapNhat = ?");
            values.push(new Date().toISOString());
            values.push(id);
            runWithErrorMap(() => getDb()
                .prepare(`UPDATE NamTuyenSinh SET ${fields.join(", ")} WHERE id = ?`)
                .run(...values), { conflict: "Năm tuyển sinh đã tồn tại" });
        }
        return (await this.findById(id));
    }
    async delete(id) {
        const existing = await this.findById(id);
        if (!existing)
            throw new NotFoundError("năm tuyển sinh");
        runWithErrorMap(() => getDb().prepare("DELETE FROM NamTuyenSinh WHERE id = ?").run(id), { foreignKey: "Không thể xóa năm tuyển sinh đang được sử dụng" });
    }
}
// ============================================
// DotTuyenSinh
// ============================================
const DOT_SELECT = `SELECT d.*, n.nam AS namTuyenSinh
  FROM DotTuyenSinh d
  JOIN NamTuyenSinh n ON d.namTuyenSinhId = n.id`;
export class SqliteDotTuyenSinhRepository {
    async findAll() {
        return getDb()
            .prepare(`${DOT_SELECT} ORDER BY n.nam DESC, d.tenDot ASC`)
            .all();
    }
    async findAllActive() {
        return getDb()
            .prepare(`${DOT_SELECT} WHERE d.trangThai = 'hoat_dong' ORDER BY n.nam DESC, d.tenDot ASC`)
            .all();
    }
    async findById(id) {
        const row = getDb()
            .prepare(`${DOT_SELECT} WHERE d.id = ?`)
            .get(id);
        return row ?? null;
    }
    async create(data) {
        const now = new Date().toISOString();
        const result = runWithErrorMap(() => getDb()
            .prepare("INSERT INTO DotTuyenSinh (tenDot, namTuyenSinhId, trangThai, ngayTao, ngayCapNhat) VALUES (?, ?, ?, ?, ?)")
            .run(data.tenDot, data.namTuyenSinhId, data.trangThai || "hoat_dong", now, now), { conflict: "Đợt tuyển sinh đã tồn tại trong năm này" });
        return (await this.findById(Number(result.lastInsertRowid)));
    }
    async update(id, data) {
        const existing = await this.findById(id);
        if (!existing)
            throw new NotFoundError("đợt tuyển sinh");
        const fields = [];
        const values = [];
        if (data.tenDot !== undefined) {
            fields.push("tenDot = ?");
            values.push(data.tenDot);
        }
        if (data.namTuyenSinhId !== undefined) {
            fields.push("namTuyenSinhId = ?");
            values.push(data.namTuyenSinhId);
        }
        if (data.trangThai !== undefined) {
            fields.push("trangThai = ?");
            values.push(data.trangThai);
        }
        if (fields.length > 0) {
            fields.push("ngayCapNhat = ?");
            values.push(new Date().toISOString());
            values.push(id);
            runWithErrorMap(() => getDb()
                .prepare(`UPDATE DotTuyenSinh SET ${fields.join(", ")} WHERE id = ?`)
                .run(...values), { conflict: "Đợt tuyển sinh đã tồn tại trong năm này" });
        }
        return (await this.findById(id));
    }
    async delete(id) {
        const existing = await this.findById(id);
        if (!existing)
            throw new NotFoundError("đợt tuyển sinh");
        runWithErrorMap(() => getDb().prepare("DELETE FROM DotTuyenSinh WHERE id = ?").run(id), { foreignKey: "Không thể xóa đợt tuyển sinh đang được sử dụng" });
    }
}
// ============================================
// NganhDangKy
// ============================================
export class SqliteNganhDangKyRepository {
    async findAll() {
        return getDb()
            .prepare("SELECT * FROM NganhDangKy ORDER BY tenNganh ASC")
            .all();
    }
    async findAllActive() {
        return getDb()
            .prepare("SELECT * FROM NganhDangKy WHERE trangThai = 'hoat_dong' ORDER BY tenNganh ASC")
            .all();
    }
    async findById(id) {
        const row = getDb()
            .prepare("SELECT * FROM NganhDangKy WHERE id = ?")
            .get(id);
        return row ?? null;
    }
    async create(data) {
        const now = new Date().toISOString();
        const result = runWithErrorMap(() => getDb()
            .prepare("INSERT INTO NganhDangKy (tenNganh, maNganh, trangThai, ngayTao, ngayCapNhat) VALUES (?, ?, ?, ?, ?)")
            .run(data.tenNganh, data.maNganh, data.trangThai || "hoat_dong", now, now), { conflict: "Mã ngành đã tồn tại" });
        return (await this.findById(Number(result.lastInsertRowid)));
    }
    async update(id, data) {
        const existing = await this.findById(id);
        if (!existing)
            throw new NotFoundError("ngành đăng ký");
        const fields = [];
        const values = [];
        if (data.tenNganh !== undefined) {
            fields.push("tenNganh = ?");
            values.push(data.tenNganh);
        }
        if (data.maNganh !== undefined) {
            fields.push("maNganh = ?");
            values.push(data.maNganh);
        }
        if (data.trangThai !== undefined) {
            fields.push("trangThai = ?");
            values.push(data.trangThai);
        }
        if (fields.length > 0) {
            fields.push("ngayCapNhat = ?");
            values.push(new Date().toISOString());
            values.push(id);
            runWithErrorMap(() => getDb()
                .prepare(`UPDATE NganhDangKy SET ${fields.join(", ")} WHERE id = ?`)
                .run(...values), { conflict: "Mã ngành đã tồn tại" });
        }
        return (await this.findById(id));
    }
    async delete(id) {
        const existing = await this.findById(id);
        if (!existing)
            throw new NotFoundError("ngành đăng ký");
        runWithErrorMap(() => getDb().prepare("DELETE FROM NganhDangKy WHERE id = ?").run(id), { foreignKey: "Không thể xóa ngành đăng ký đang được sử dụng" });
    }
}
// ============================================
// HeDaoTao
// ============================================
export class SqliteHeDaoTaoRepository {
    async findAll() {
        return getDb()
            .prepare("SELECT * FROM HeDaoTao ORDER BY tenHe ASC")
            .all();
    }
    async findAllActive() {
        return getDb()
            .prepare("SELECT * FROM HeDaoTao WHERE trangThai = 'hoat_dong' ORDER BY tenHe ASC")
            .all();
    }
    async findById(id) {
        const row = getDb()
            .prepare("SELECT * FROM HeDaoTao WHERE id = ?")
            .get(id);
        return row ?? null;
    }
    async create(data) {
        const now = new Date().toISOString();
        const result = runWithErrorMap(() => getDb()
            .prepare("INSERT INTO HeDaoTao (tenHe, trangThai, ngayTao, ngayCapNhat) VALUES (?, ?, ?, ?)")
            .run(data.tenHe, data.trangThai || "hoat_dong", now, now), { conflict: "Hệ đào tạo đã tồn tại" });
        return (await this.findById(Number(result.lastInsertRowid)));
    }
    async update(id, data) {
        const existing = await this.findById(id);
        if (!existing)
            throw new NotFoundError("hệ đào tạo");
        const fields = [];
        const values = [];
        if (data.tenHe !== undefined) {
            fields.push("tenHe = ?");
            values.push(data.tenHe);
        }
        if (data.trangThai !== undefined) {
            fields.push("trangThai = ?");
            values.push(data.trangThai);
        }
        if (fields.length > 0) {
            fields.push("ngayCapNhat = ?");
            values.push(new Date().toISOString());
            values.push(id);
            runWithErrorMap(() => getDb()
                .prepare(`UPDATE HeDaoTao SET ${fields.join(", ")} WHERE id = ?`)
                .run(...values), { conflict: "Hệ đào tạo đã tồn tại" });
        }
        return (await this.findById(id));
    }
    async delete(id) {
        const existing = await this.findById(id);
        if (!existing)
            throw new NotFoundError("hệ đào tạo");
        runWithErrorMap(() => getDb().prepare("DELETE FROM HeDaoTao WHERE id = ?").run(id), { foreignKey: "Không thể xóa hệ đào tạo đang được sử dụng" });
    }
}
