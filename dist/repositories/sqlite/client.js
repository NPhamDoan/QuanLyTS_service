import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcryptjs from "bcryptjs";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/**
 * SQLite connection singleton — lazy-initialized.
 *
 * Khi chạy với DB_TYPE=supabase, file này được import (vì factory
 * import cả hai tập repositories) nhưng connection KHÔNG bao giờ được tạo,
 * vì Supabase repos không gọi `getDb()`.
 */
let _db = null;
function initDb() {
    // __dirname = backend/dist/repositories/sqlite hoặc backend/src/repositories/sqlite khi dev.
    // File db/*.sql nằm ở backend/db/, tức 3 cấp lên.
    const dbPath = path.join(__dirname, "../../../db/dev.db");
    const initSql = fs.readFileSync(path.join(__dirname, "../../../db/init.sql"), "utf8");
    const conn = new Database(dbPath);
    conn.pragma("foreign_keys = ON");
    conn.exec(initSql);
    // Seed admin nếu TaiKhoan rỗng (giữ hành vi hiện tại).
    // Với Supabase, bootstrap.ts lo việc này.
    const adminExists = conn
        .prepare("SELECT COUNT(*) as count FROM TaiKhoan")
        .get();
    if (adminExists.count === 0) {
        const hash = bcryptjs.hashSync("123456", 10);
        const now = new Date().toISOString();
        conn
            .prepare(`INSERT INTO TaiKhoan (tenDangNhap, matKhauHash, hoTen, vaiTro, trangThai, ngayTao, ngayCapNhat)
         VALUES (?, ?, ?, ?, ?, ?, ?)`)
            .run("admin", hash, "Quản trị viên", "admin", "hoat_dong", now, now);
    }
    return conn;
}
export function getDb() {
    if (!_db)
        _db = initDb();
    return _db;
}
