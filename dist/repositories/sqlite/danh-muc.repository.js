import { getDb } from "./client.js";
import { runWithErrorMap } from "./error-map.js";
import { logQuery, logQueryError } from "../../logger.js";
import { NotFoundError } from "../../domain/errors.js";
// ============================================
// NamTuyenSinh
// ============================================
export class SqliteNamTuyenSinhRepository {
    async findAll() {
        logQuery("SqliteNamTuyenSinhRepository", "findAll", {});
        try {
            return getDb()
                .prepare("SELECT * FROM NamTuyenSinh ORDER BY nam DESC")
                .all();
        }
        catch (err) {
            logQueryError("SqliteNamTuyenSinhRepository", "findAll", err);
            throw err;
        }
    }
    async findAllActive() {
        logQuery("SqliteNamTuyenSinhRepository", "findAllActive", {});
        try {
            return getDb()
                .prepare("SELECT * FROM NamTuyenSinh WHERE trangThai = 'hoat_dong' ORDER BY nam DESC")
                .all();
        }
        catch (err) {
            logQueryError("SqliteNamTuyenSinhRepository", "findAllActive", err);
            throw err;
        }
    }
    async findById(id) {
        logQuery("SqliteNamTuyenSinhRepository", "findById", { id });
        try {
            const row = getDb()
                .prepare("SELECT * FROM NamTuyenSinh WHERE id = ?")
                .get(id);
            return row ?? null;
        }
        catch (err) {
            logQueryError("SqliteNamTuyenSinhRepository", "findById", err);
            throw err;
        }
    }
    async create(data) {
        logQuery("SqliteNamTuyenSinhRepository", "create", { data });
        try {
            const now = new Date().toISOString();
            const result = runWithErrorMap(() => getDb()
                .prepare("INSERT INTO NamTuyenSinh (nam, trangThai, ngayTao, ngayCapNhat) VALUES (?, ?, ?, ?)")
                .run(data.nam, data.trangThai || "hoat_dong", now, now), { conflict: "Năm tuyển sinh đã tồn tại" });
            return (await this.findById(Number(result.lastInsertRowid)));
        }
        catch (err) {
            logQueryError("SqliteNamTuyenSinhRepository", "create", err);
            throw err;
        }
    }
    async update(id, data) {
        logQuery("SqliteNamTuyenSinhRepository", "update", { id, data });
        try {
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
        catch (err) {
            logQueryError("SqliteNamTuyenSinhRepository", "update", err);
            throw err;
        }
    }
    async delete(id) {
        logQuery("SqliteNamTuyenSinhRepository", "delete", { id });
        try {
            const existing = await this.findById(id);
            if (!existing)
                throw new NotFoundError("năm tuyển sinh");
            runWithErrorMap(() => getDb().prepare("DELETE FROM NamTuyenSinh WHERE id = ?").run(id), { foreignKey: "Không thể xóa năm tuyển sinh đang được sử dụng" });
        }
        catch (err) {
            logQueryError("SqliteNamTuyenSinhRepository", "delete", err);
            throw err;
        }
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
        logQuery("SqliteDotTuyenSinhRepository", "findAll", {});
        try {
            return getDb()
                .prepare(`${DOT_SELECT} ORDER BY n.nam DESC, d.tenDot ASC`)
                .all();
        }
        catch (err) {
            logQueryError("SqliteDotTuyenSinhRepository", "findAll", err);
            throw err;
        }
    }
    async findAllActive() {
        logQuery("SqliteDotTuyenSinhRepository", "findAllActive", {});
        try {
            return getDb()
                .prepare(`${DOT_SELECT} WHERE d.trangThai = 'hoat_dong' ORDER BY n.nam DESC, d.tenDot ASC`)
                .all();
        }
        catch (err) {
            logQueryError("SqliteDotTuyenSinhRepository", "findAllActive", err);
            throw err;
        }
    }
    async findById(id) {
        logQuery("SqliteDotTuyenSinhRepository", "findById", { id });
        try {
            const row = getDb()
                .prepare(`${DOT_SELECT} WHERE d.id = ?`)
                .get(id);
            return row ?? null;
        }
        catch (err) {
            logQueryError("SqliteDotTuyenSinhRepository", "findById", err);
            throw err;
        }
    }
    async create(data) {
        logQuery("SqliteDotTuyenSinhRepository", "create", { data });
        try {
            const now = new Date().toISOString();
            const result = runWithErrorMap(() => getDb()
                .prepare("INSERT INTO DotTuyenSinh (tenDot, namTuyenSinhId, trangThai, ngayTao, ngayCapNhat) VALUES (?, ?, ?, ?, ?)")
                .run(data.tenDot, data.namTuyenSinhId, data.trangThai || "hoat_dong", now, now), { conflict: "Đợt tuyển sinh đã tồn tại trong năm này" });
            return (await this.findById(Number(result.lastInsertRowid)));
        }
        catch (err) {
            logQueryError("SqliteDotTuyenSinhRepository", "create", err);
            throw err;
        }
    }
    async update(id, data) {
        logQuery("SqliteDotTuyenSinhRepository", "update", { id, data });
        try {
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
        catch (err) {
            logQueryError("SqliteDotTuyenSinhRepository", "update", err);
            throw err;
        }
    }
    async delete(id) {
        logQuery("SqliteDotTuyenSinhRepository", "delete", { id });
        try {
            const existing = await this.findById(id);
            if (!existing)
                throw new NotFoundError("đợt tuyển sinh");
            runWithErrorMap(() => getDb().prepare("DELETE FROM DotTuyenSinh WHERE id = ?").run(id), { foreignKey: "Không thể xóa đợt tuyển sinh đang được sử dụng" });
        }
        catch (err) {
            logQueryError("SqliteDotTuyenSinhRepository", "delete", err);
            throw err;
        }
    }
}
// ============================================
// NganhDangKy
// ============================================
export class SqliteNganhDangKyRepository {
    async findAll() {
        logQuery("SqliteNganhDangKyRepository", "findAll", {});
        try {
            return getDb()
                .prepare("SELECT * FROM NganhDangKy ORDER BY tenNganh ASC")
                .all();
        }
        catch (err) {
            logQueryError("SqliteNganhDangKyRepository", "findAll", err);
            throw err;
        }
    }
    async findAllActive() {
        logQuery("SqliteNganhDangKyRepository", "findAllActive", {});
        try {
            return getDb()
                .prepare("SELECT * FROM NganhDangKy WHERE trangThai = 'hoat_dong' ORDER BY tenNganh ASC")
                .all();
        }
        catch (err) {
            logQueryError("SqliteNganhDangKyRepository", "findAllActive", err);
            throw err;
        }
    }
    async findById(id) {
        logQuery("SqliteNganhDangKyRepository", "findById", { id });
        try {
            const row = getDb()
                .prepare("SELECT * FROM NganhDangKy WHERE id = ?")
                .get(id);
            return row ?? null;
        }
        catch (err) {
            logQueryError("SqliteNganhDangKyRepository", "findById", err);
            throw err;
        }
    }
    async create(data) {
        logQuery("SqliteNganhDangKyRepository", "create", { data });
        try {
            const now = new Date().toISOString();
            const result = runWithErrorMap(() => getDb()
                .prepare("INSERT INTO NganhDangKy (tenNganh, maNganh, trangThai, ngayTao, ngayCapNhat) VALUES (?, ?, ?, ?, ?)")
                .run(data.tenNganh, data.maNganh, data.trangThai || "hoat_dong", now, now), { conflict: "Mã ngành đã tồn tại" });
            return (await this.findById(Number(result.lastInsertRowid)));
        }
        catch (err) {
            logQueryError("SqliteNganhDangKyRepository", "create", err);
            throw err;
        }
    }
    async update(id, data) {
        logQuery("SqliteNganhDangKyRepository", "update", { id, data });
        try {
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
        catch (err) {
            logQueryError("SqliteNganhDangKyRepository", "update", err);
            throw err;
        }
    }
    async delete(id) {
        logQuery("SqliteNganhDangKyRepository", "delete", { id });
        try {
            const existing = await this.findById(id);
            if (!existing)
                throw new NotFoundError("ngành đăng ký");
            runWithErrorMap(() => getDb().prepare("DELETE FROM NganhDangKy WHERE id = ?").run(id), { foreignKey: "Không thể xóa ngành đăng ký đang được sử dụng" });
        }
        catch (err) {
            logQueryError("SqliteNganhDangKyRepository", "delete", err);
            throw err;
        }
    }
}
// ============================================
// HeDaoTao
// ============================================
export class SqliteHeDaoTaoRepository {
    async findAll() {
        logQuery("SqliteHeDaoTaoRepository", "findAll", {});
        try {
            return getDb()
                .prepare("SELECT * FROM HeDaoTao ORDER BY tenHe ASC")
                .all();
        }
        catch (err) {
            logQueryError("SqliteHeDaoTaoRepository", "findAll", err);
            throw err;
        }
    }
    async findAllActive() {
        logQuery("SqliteHeDaoTaoRepository", "findAllActive", {});
        try {
            return getDb()
                .prepare("SELECT * FROM HeDaoTao WHERE trangThai = 'hoat_dong' ORDER BY tenHe ASC")
                .all();
        }
        catch (err) {
            logQueryError("SqliteHeDaoTaoRepository", "findAllActive", err);
            throw err;
        }
    }
    async findById(id) {
        logQuery("SqliteHeDaoTaoRepository", "findById", { id });
        try {
            const row = getDb()
                .prepare("SELECT * FROM HeDaoTao WHERE id = ?")
                .get(id);
            return row ?? null;
        }
        catch (err) {
            logQueryError("SqliteHeDaoTaoRepository", "findById", err);
            throw err;
        }
    }
    async create(data) {
        logQuery("SqliteHeDaoTaoRepository", "create", { data });
        try {
            const now = new Date().toISOString();
            const result = runWithErrorMap(() => getDb()
                .prepare("INSERT INTO HeDaoTao (tenHe, trangThai, ngayTao, ngayCapNhat) VALUES (?, ?, ?, ?)")
                .run(data.tenHe, data.trangThai || "hoat_dong", now, now), { conflict: "Hệ đào tạo đã tồn tại" });
            return (await this.findById(Number(result.lastInsertRowid)));
        }
        catch (err) {
            logQueryError("SqliteHeDaoTaoRepository", "create", err);
            throw err;
        }
    }
    async update(id, data) {
        logQuery("SqliteHeDaoTaoRepository", "update", { id, data });
        try {
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
        catch (err) {
            logQueryError("SqliteHeDaoTaoRepository", "update", err);
            throw err;
        }
    }
    async delete(id) {
        logQuery("SqliteHeDaoTaoRepository", "delete", { id });
        try {
            const existing = await this.findById(id);
            if (!existing)
                throw new NotFoundError("hệ đào tạo");
            runWithErrorMap(() => getDb().prepare("DELETE FROM HeDaoTao WHERE id = ?").run(id), { foreignKey: "Không thể xóa hệ đào tạo đang được sử dụng" });
        }
        catch (err) {
            logQueryError("SqliteHeDaoTaoRepository", "delete", err);
            throw err;
        }
    }
}
