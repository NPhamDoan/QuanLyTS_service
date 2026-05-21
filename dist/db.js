import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcryptjs from "bcryptjs";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/**
 * Lazy-initialized SQLite connection.
 * Chỉ được tạo khi SQLite repo gọi `getDb()` lần đầu.
 * Khi chạy với DB_TYPE=supabase, file này được import nhưng connection
 * KHÔNG bao giờ được tạo → không chạy init.sql, không tạo file dev.db.
 */
let _db = null;
function initDb() {
    const dbPath = path.join(__dirname, "../db/dev.db");
    const initSql = fs.readFileSync(path.join(__dirname, "../db/init.sql"), "utf8");
    const conn = new Database(dbPath);
    conn.pragma("foreign_keys = ON");
    conn.exec(initSql);
    // Seed default admin account if TaiKhoan table is empty
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
/**
 * Proxy object giữ API cũ `db.prepare(...)`. SQLite repos dùng `db.prepare`
 * sẽ trigger init lần đầu. File này không tạo connection khi import.
 */
const db = new Proxy({}, {
    get(_target, prop) {
        const conn = getDb();
        const value = conn[prop];
        return typeof value === "function" ? value.bind(conn) : value;
    },
});
export default db;
