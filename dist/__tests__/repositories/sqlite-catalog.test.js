/**
 * Integration tests cho 4 catalog repository SQLite, sau refactor sang
 * `makeSqliteCatalogRepo`. Dùng better-sqlite3 in-memory để verify CRUD
 * thật trên schema thật, không mock query layer.
 *
 * Mục đích: bảo vệ refactor không đổi behavior — pattern findAll /
 * findAllActive / findById / create / update / delete cùng UNIQUE conflict
 * và FK constraint giữa Dot ↔ Nam.
 */
import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Tắt noise log trong test runner: catalog-repo.ts gọi logQuery/logQueryError
// xuyên suốt và một số test cố ý trigger conflict / FK để verify error.
vi.mock("../../logger.js", async () => {
    const actual = await vi.importActual("../../logger.js");
    return {
        ...actual,
        logQuery: vi.fn(),
        logQueryError: vi.fn(),
    };
});
// Một connection in-memory chia sẻ cho cả test suite — schema reset 1 lần.
const conn = new Database(":memory:");
// Mock `getDb` của module client để mọi catalog repo dùng connection
// in-memory này thay vì singleton thật.
vi.mock("../../repositories/sqlite/client.js", () => ({
    getDb: () => conn,
}));
// Import sau khi đã mock — giờ catalog-repo.ts → client.ts → conn của ta.
import { SqliteNamTuyenSinhRepository, SqliteDotTuyenSinhRepository, SqliteNganhDangKyRepository, SqliteHeDaoTaoRepository, } from "../../repositories/sqlite/danh-muc.repository.js";
import { ConflictError, ForeignKeyError, NotFoundError, } from "../../domain/errors.js";
beforeAll(() => {
    conn.pragma("foreign_keys = ON");
    // Chỉ chạy phần CREATE TABLE — bỏ DROP và SEED để khởi tạo sạch.
    // Schema lấy thẳng từ init.sql để đồng bộ với production.
    const initSql = fs.readFileSync(path.join(__dirname, "../../../db/init.sql"), "utf8");
    // Strip DROP statements (in-memory không cần) và SEED (sẽ insert tay).
    const lines = initSql.split("\n");
    const buf = [];
    let skipMode = null;
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("DROP TABLE"))
            continue;
        if (trimmed.startsWith("INSERT INTO")) {
            skipMode = "seed";
            continue;
        }
        if (skipMode === "seed") {
            // skip cho tới khi gặp dòng kết thúc bằng ;
            if (trimmed.endsWith(";"))
                skipMode = null;
            continue;
        }
        buf.push(line);
    }
    conn.exec(buf.join("\n"));
});
afterAll(() => {
    conn.close();
});
describe("SqliteNamTuyenSinhRepository (refactored)", () => {
    const repo = new SqliteNamTuyenSinhRepository();
    it("create + findById + update + delete vòng đầy đủ", async () => {
        const created = await repo.create({ nam: "2099" });
        expect(created.nam).toBe("2099");
        expect(created.trangThai).toBe("hoat_dong");
        expect(created.id).toBeGreaterThan(0);
        expect(created.ngayTao).toBeTruthy();
        expect(created.ngayCapNhat).toBeTruthy();
        const found = await repo.findById(created.id);
        expect(found).toEqual(created);
        const updated = await repo.update(created.id, { trangThai: "khong_hoat_dong" });
        expect(updated.trangThai).toBe("khong_hoat_dong");
        expect(updated.nam).toBe("2099");
        expect(updated.ngayCapNhat).not.toBe(created.ngayCapNhat);
        await repo.delete(created.id);
        expect(await repo.findById(created.id)).toBeNull();
    });
    it("throws ConflictError cho UNIQUE violation trên nam", async () => {
        await repo.create({ nam: "2098" });
        await expect(repo.create({ nam: "2098" })).rejects.toBeInstanceOf(ConflictError);
    });
    it("throws NotFoundError khi update id không tồn tại", async () => {
        await expect(repo.update(99999, { nam: "x" })).rejects.toBeInstanceOf(NotFoundError);
    });
    it("throws NotFoundError khi delete id không tồn tại", async () => {
        await expect(repo.delete(99999)).rejects.toBeInstanceOf(NotFoundError);
    });
    it("findAllActive chỉ trả các record active", async () => {
        const a = await repo.create({ nam: "2090", trangThai: "hoat_dong" });
        const b = await repo.create({ nam: "2091", trangThai: "khong_hoat_dong" });
        const active = await repo.findAllActive();
        const ids = active.map((r) => r.id);
        expect(ids).toContain(a.id);
        expect(ids).not.toContain(b.id);
        await repo.delete(a.id);
        await repo.delete(b.id);
    });
    it("update với data rỗng giữ nguyên record", async () => {
        const created = await repo.create({ nam: "2080" });
        const updated = await repo.update(created.id, {});
        // Theo invariant cũ: không UPDATE nếu fields.length === 0
        // → ngayCapNhat giữ nguyên giá trị create.
        expect(updated.ngayCapNhat).toBe(created.ngayCapNhat);
        expect(updated.nam).toBe("2080");
        await repo.delete(created.id);
    });
});
describe("SqliteDotTuyenSinhRepository (refactored, with JOIN)", () => {
    const namRepo = new SqliteNamTuyenSinhRepository();
    const dotRepo = new SqliteDotTuyenSinhRepository();
    it("findById trả namTuyenSinh từ JOIN", async () => {
        const nam = await namRepo.create({ nam: "2070" });
        const dot = await dotRepo.create({
            tenDot: "Đợt Test",
            namTuyenSinhId: nam.id,
        });
        const found = await dotRepo.findById(dot.id);
        expect(found).not.toBeNull();
        expect(found.namTuyenSinh).toBe("2070");
        expect(found.tenDot).toBe("Đợt Test");
        await dotRepo.delete(dot.id);
        await namRepo.delete(nam.id);
    });
    it("UNIQUE (tenDot, namTuyenSinhId) — cùng năm cùng tên đợt phải fail", async () => {
        const nam = await namRepo.create({ nam: "2071" });
        await dotRepo.create({ tenDot: "Đợt 1", namTuyenSinhId: nam.id });
        await expect(dotRepo.create({ tenDot: "Đợt 1", namTuyenSinhId: nam.id })).rejects.toBeInstanceOf(ConflictError);
        // Cleanup: xóa đợt rồi xóa năm
        const all = await dotRepo.findAll();
        for (const d of all.filter((x) => x.namTuyenSinhId === nam.id)) {
            await dotRepo.delete(d.id);
        }
        await namRepo.delete(nam.id);
    });
    it("delete nam đang được dùng → ForeignKeyError", async () => {
        const nam = await namRepo.create({ nam: "2072" });
        const dot = await dotRepo.create({ tenDot: "X", namTuyenSinhId: nam.id });
        await expect(namRepo.delete(nam.id)).rejects.toBeInstanceOf(ForeignKeyError);
        await dotRepo.delete(dot.id);
        await namRepo.delete(nam.id);
    });
});
describe("SqliteNganhDangKyRepository (refactored)", () => {
    const repo = new SqliteNganhDangKyRepository();
    it("create + UNIQUE maNganh", async () => {
        const a = await repo.create({ tenNganh: "Test A", maNganh: "TST-A" });
        expect(a.maNganh).toBe("TST-A");
        await expect(repo.create({ tenNganh: "Test A2", maNganh: "TST-A" })).rejects.toBeInstanceOf(ConflictError);
        await repo.delete(a.id);
    });
});
describe("SqliteHeDaoTaoRepository (refactored)", () => {
    const repo = new SqliteHeDaoTaoRepository();
    it("create + UNIQUE tenHe", async () => {
        const a = await repo.create({ tenHe: "He Test" });
        expect(a.tenHe).toBe("He Test");
        await expect(repo.create({ tenHe: "He Test" })).rejects.toBeInstanceOf(ConflictError);
        await repo.delete(a.id);
    });
});
