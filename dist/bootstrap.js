import bcryptjs from "bcryptjs";
import { repos } from "./repositories/index.js";
import { logger } from "./logger.js";
/**
 * Bootstrap chạy sau khi repos được khởi tạo.
 * Seed tài khoản admin mặc định nếu DB chưa có user nào.
 *
 * - Với SQLite: seed do `repositories/sqlite/client.ts` đảm nhiệm khi
 *   `getDb()` chạy lần đầu — hàm này phát hiện count > 0 và no-op.
 * - Với Supabase: đây là nơi duy nhất seed admin.
 */
export async function ensureAdminAccount() {
    const count = await repos.taiKhoan.count();
    if (count > 0)
        return;
    const matKhauHash = bcryptjs.hashSync("123456", 10);
    await repos.taiKhoan.create({
        tenDangNhap: "admin",
        matKhauHash,
        hoTen: "Quản trị viên",
        vaiTro: "admin",
    });
    logger.info("[bootstrap] Đã tạo tài khoản admin mặc định.");
}
