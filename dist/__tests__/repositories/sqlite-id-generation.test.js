/**
 * Integration tests cho atomic ID generation (SqliteSinhVien / SqliteHoSo).
 *
 * Verify:
 * 1. Sinh sequential trong điều kiện normal (1 thread, không race).
 * 2. Sinh không trùng khi chạy serial nhiều lần liên tiếp.
 *
 * Note: better-sqlite3 là sync API → từ Node thread chính không thể
 * thực sự "concurrent" 2 INSERT cùng lúc, vì mỗi prepare/run block.
 * Transaction wrap chỉ thật sự cần thiết với DB async (Postgres /
 * Supabase). Test này verify behavior đúng và regression cho seq.
 */
import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const conn = new Database(":memory:");
vi.mock("../../repositories/sqlite/client.js", () => ({
    getDb: () => conn,
}));
vi.mock("../../logger.js", async () => {
    const actual = await vi.importActual("../../logger.js");
    return {
        ...actual,
        logQuery: vi.fn(),
        logQueryError: vi.fn(),
    };
});
import { SqliteSinhVienRepository } from "../../repositories/sqlite/sinh-vien.repository.js";
import { SqliteHoSoTuyenSinhRepository } from "../../repositories/sqlite/ho-so.repository.js";
beforeAll(() => {
    conn.pragma("foreign_keys = ON");
    const initSql = fs.readFileSync(path.join(__dirname, "../../../db/init.sql"), "utf8");
    // Bỏ DROP và INSERT (seed) — chỉ giữ CREATE TABLE.
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
            if (trimmed.endsWith(";"))
                skipMode = null;
            continue;
        }
        buf.push(line);
    }
    conn.exec(buf.join("\n"));
    // Seed data tối thiểu cho HoSoTuyenSinh (cần FK đến SinhVien + danh mục).
    conn
        .prepare(`INSERT INTO NamTuyenSinh (nam, trangThai, ngayTao, ngayCapNhat)
       VALUES (?, 'hoat_dong', ?, ?)`)
        .run("2099", "2099-01-01", "2099-01-01");
    conn
        .prepare(`INSERT INTO DotTuyenSinh (tenDot, namTuyenSinhId, trangThai, ngayTao, ngayCapNhat)
       VALUES (?, 1, 'hoat_dong', ?, ?)`)
        .run("Đợt 1", "2099-01-01", "2099-01-01");
    conn
        .prepare(`INSERT INTO NganhDangKy (tenNganh, maNganh, trangThai, ngayTao, ngayCapNhat)
       VALUES (?, ?, 'hoat_dong', ?, ?)`)
        .run("CNTT", "CNTT", "2099-01-01", "2099-01-01");
    conn
        .prepare(`INSERT INTO HeDaoTao (tenHe, trangThai, ngayTao, ngayCapNhat)
       VALUES (?, 'hoat_dong', ?, ?)`)
        .run("Đại học chính quy", "2099-01-01", "2099-01-01");
});
afterAll(() => {
    conn.close();
});
const SAMPLE_SV_INPUT = {
    hoTen: "Nguyễn Văn A",
    ngaySinh: "2000-01-01",
    gioiTinh: "Nam",
    cccd: "012345678901",
    email: "a@example.com",
    soDienThoai: "0901234567",
    diaChi: "TP. HCM",
};
describe("SqliteSinhVienRepository.create — atomic generation", () => {
    const repo = new SqliteSinhVienRepository();
    it("Sinh maSinhVien sequential SV-YYYY0001, SV-YYYY0002, ...", async () => {
        const year = new Date().getFullYear();
        const a = await repo.create({ ...SAMPLE_SV_INPUT, cccd: "111" });
        const b = await repo.create({ ...SAMPLE_SV_INPUT, cccd: "222" });
        const c = await repo.create({ ...SAMPLE_SV_INPUT, cccd: "333" });
        expect(a.maSinhVien).toBe(`SV-${year}0001`);
        expect(b.maSinhVien).toBe(`SV-${year}0002`);
        expect(c.maSinhVien).toBe(`SV-${year}0003`);
    });
    it("Tất cả mã sinh ra đều unique (không trùng)", async () => {
        const N = 30;
        const created = await Promise.all(Array.from({ length: N }, (_, i) => repo.create({ ...SAMPLE_SV_INPUT, cccd: `bulk-${i}` })));
        const ids = created.map((s) => s.maSinhVien);
        expect(new Set(ids).size).toBe(N);
    });
});
describe("SqliteHoSoTuyenSinhRepository.create — atomic generation", () => {
    const svRepo = new SqliteSinhVienRepository();
    const hsRepo = new SqliteHoSoTuyenSinhRepository();
    it("Sinh maHoSo sequential HS-YYYY0001, HS-YYYY0002, ...", async () => {
        const sv = await svRepo.create({
            ...SAMPLE_SV_INPUT,
            cccd: "ho-so-test-1",
        });
        const year = new Date().getFullYear();
        const a = await hsRepo.create({
            maSinhVien: sv.maSinhVien,
            namTuyenSinhId: 1,
            dotTuyenSinhId: 1,
            nganhDangKyId: 1,
            heDaoTaoId: 1,
        });
        const b = await hsRepo.create({
            maSinhVien: sv.maSinhVien,
            namTuyenSinhId: 1,
            dotTuyenSinhId: 1,
            nganhDangKyId: 1,
            heDaoTaoId: 1,
        });
        expect(a.maHoSo).toBe(`HS-${year}0001`);
        expect(b.maHoSo).toBe(`HS-${year}0002`);
    });
    it("Tất cả maHoSo bulk insert đều unique", async () => {
        const sv = await svRepo.create({
            ...SAMPLE_SV_INPUT,
            cccd: "ho-so-test-2",
        });
        const N = 20;
        const created = await Promise.all(Array.from({ length: N }, () => hsRepo.create({
            maSinhVien: sv.maSinhVien,
            namTuyenSinhId: 1,
            dotTuyenSinhId: 1,
            nganhDangKyId: 1,
            heDaoTaoId: 1,
        })));
        const ids = created.map((h) => h.maHoSo);
        expect(new Set(ids).size).toBe(N);
    });
    it("Trong một transaction, generate + insert là atomic — rollback nếu insert fail", async () => {
        // Cố tình cung cấp maSinhVien không tồn tại → FK fail → tx rollback
        // → seq KHÔNG bị tăng (mã rảnh được sinh ra trong tx tiếp theo).
        const before = await hsRepo.create({
            maSinhVien: (await svRepo.create({ ...SAMPLE_SV_INPUT, cccd: "tx-1" }))
                .maSinhVien,
            namTuyenSinhId: 1,
            dotTuyenSinhId: 1,
            nganhDangKyId: 1,
            heDaoTaoId: 1,
        });
        await expect(hsRepo.create({
            maSinhVien: "SV-INVALID",
            namTuyenSinhId: 1,
            dotTuyenSinhId: 1,
            nganhDangKyId: 1,
            heDaoTaoId: 1,
        })).rejects.toThrow();
        const after = await hsRepo.create({
            maSinhVien: (await svRepo.create({ ...SAMPLE_SV_INPUT, cccd: "tx-2" }))
                .maSinhVien,
            namTuyenSinhId: 1,
            dotTuyenSinhId: 1,
            nganhDangKyId: 1,
            heDaoTaoId: 1,
        });
        // before và after có seq liên tiếp (sai 1 đơn vị) — chứng tỏ tx fail
        // không "ăn" 1 seq.
        const beforeSeq = parseInt(before.maHoSo.slice(-4), 10);
        const afterSeq = parseInt(after.maHoSo.slice(-4), 10);
        expect(afterSeq).toBe(beforeSeq + 1);
    });
});
