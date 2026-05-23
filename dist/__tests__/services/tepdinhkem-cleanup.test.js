/**
 * Feature: file cleanup khi xoa tep dinh kem.
 *
 * Test xoaTepDinhKem service:
 * - File ton tai -> DB row bi xoa va file vat ly bi unlink.
 * - File khong ton tai (orphan DB row) -> chi xoa DB row, khong throw,
 *   khong log error level (chi warn neu loi khac ENOENT).
 * - maTep khong ton tai trong DB -> idempotent, return success.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";
import { randomUUID } from "crypto";
// Mock cac module truoc khi import service.
// Dung vi.hoisted de chia se gia tri voi vi.mock factory (vi.mock duoc
// hoisted ve dau file truoc moi top-level statement).
const { tmpDir } = vi.hoisted(() => {
    const path = require("path");
    const os = require("os");
    const { randomUUID } = require("crypto");
    return { tmpDir: path.join(os.tmpdir(), `qlts-test-${randomUUID()}`) };
});
vi.mock("../../repositories/index.js", () => ({
    repos: {
        tepDinhKem: {
            findById: vi.fn(),
            delete: vi.fn(),
        },
    },
}));
vi.mock("../../utils/storage.js", () => ({
    uploadsRoot: tmpDir,
    publicDir: tmpDir,
    privateDir: tmpDir,
}));
import { repos } from "../../repositories/index.js";
import { xoaTepDinhKem } from "../../services/tepdinhkem.service.js";
const findByIdMock = repos.tepDinhKem.findById;
const deleteMock = repos.tepDinhKem.delete;
beforeEach(async () => {
    await fs.mkdir(tmpDir, { recursive: true });
    vi.clearAllMocks();
});
afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
});
describe("xoaTepDinhKem", () => {
    it("xoa DB row va file vat ly khi ca hai ton tai", async () => {
        const filename = `${randomUUID()}.pdf`;
        const filePath = path.join(tmpDir, filename);
        await fs.writeFile(filePath, "test content");
        expect(existsSync(filePath)).toBe(true);
        const maTep = randomUUID();
        findByIdMock.mockResolvedValue({
            maTep,
            maHoSo: "HS-2024-0001",
            tenTep: "test.pdf",
            duongDan: `/private/${filename}`,
            loaiTep: "application/pdf",
        });
        deleteMock.mockResolvedValue(undefined);
        const result = await xoaTepDinhKem(maTep);
        expect(result).toEqual({ success: true, maTep });
        expect(findByIdMock).toHaveBeenCalledWith(maTep);
        expect(deleteMock).toHaveBeenCalledWith(maTep);
        expect(existsSync(filePath)).toBe(false);
    });
    it("xoa DB row binh thuong khi file vat ly khong ton tai (orphan)", async () => {
        const maTep = randomUUID();
        findByIdMock.mockResolvedValue({
            maTep,
            maHoSo: "HS-2024-0001",
            tenTep: "missing.pdf",
            duongDan: "/private/does-not-exist.pdf",
            loaiTep: "application/pdf",
        });
        deleteMock.mockResolvedValue(undefined);
        // Khong throw — ENOENT duoc nuot lang im
        await expect(xoaTepDinhKem(maTep)).resolves.toEqual({
            success: true,
            maTep,
        });
        expect(deleteMock).toHaveBeenCalledWith(maTep);
    });
    it("idempotent khi maTep khong ton tai trong DB", async () => {
        const maTep = randomUUID();
        findByIdMock.mockResolvedValue(null);
        deleteMock.mockResolvedValue(undefined);
        const result = await xoaTepDinhKem(maTep);
        expect(result).toEqual({ success: true, maTep });
        // delete van duoc goi (giu hanh vi cu) nhung khong co buoc unlink
        expect(deleteMock).toHaveBeenCalledWith(maTep);
    });
});
