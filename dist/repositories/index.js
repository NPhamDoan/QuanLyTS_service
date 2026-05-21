/**
 * Repository factory — chọn implementation dựa trên env `DB_TYPE`.
 * Hiện tại chỉ có `sqlite`. Khi sẵn sàng Supabase, thêm case `supabase` ở đây.
 *
 * Services import từ file này để lấy repo instances — KHÔNG import trực tiếp
 * từ folder implementation (sqlite/, supabase/...).
 */
import { SqliteTaiKhoanRepository } from "./sqlite/tai-khoan.repository.js";
import { SqliteRefreshTokenRepository } from "./sqlite/refresh-token.repository.js";
import { SqliteNamTuyenSinhRepository, SqliteDotTuyenSinhRepository, SqliteNganhDangKyRepository, SqliteHeDaoTaoRepository, } from "./sqlite/danh-muc.repository.js";
import { SqliteSinhVienRepository } from "./sqlite/sinh-vien.repository.js";
import { SqliteHoSoTuyenSinhRepository } from "./sqlite/ho-so.repository.js";
import { SqliteTepDinhKemRepository } from "./sqlite/tep-dinh-kem.repository.js";
import { SqliteLichSuCapNhatRepository } from "./sqlite/lich-su.repository.js";
import { SupabaseTaiKhoanRepository } from "./supabase/tai-khoan.repository.js";
import { SupabaseRefreshTokenRepository } from "./supabase/refresh-token.repository.js";
import { SupabaseNamTuyenSinhRepository, SupabaseDotTuyenSinhRepository, SupabaseNganhDangKyRepository, SupabaseHeDaoTaoRepository, } from "./supabase/danh-muc.repository.js";
import { SupabaseSinhVienRepository } from "./supabase/sinh-vien.repository.js";
import { SupabaseHoSoTuyenSinhRepository } from "./supabase/ho-so.repository.js";
import { SupabaseTepDinhKemRepository } from "./supabase/tep-dinh-kem.repository.js";
import { SupabaseLichSuCapNhatRepository } from "./supabase/lich-su.repository.js";
const dbType = (process.env.DB_TYPE || "sqlite").toLowerCase();
function createRepositories() {
    switch (dbType) {
        case "sqlite":
            return {
                taiKhoan: new SqliteTaiKhoanRepository(),
                refreshToken: new SqliteRefreshTokenRepository(),
                namTuyenSinh: new SqliteNamTuyenSinhRepository(),
                dotTuyenSinh: new SqliteDotTuyenSinhRepository(),
                nganhDangKy: new SqliteNganhDangKyRepository(),
                heDaoTao: new SqliteHeDaoTaoRepository(),
                sinhVien: new SqliteSinhVienRepository(),
                hoSo: new SqliteHoSoTuyenSinhRepository(),
                tepDinhKem: new SqliteTepDinhKemRepository(),
                lichSu: new SqliteLichSuCapNhatRepository(),
            };
        case "supabase":
            return {
                taiKhoan: new SupabaseTaiKhoanRepository(),
                refreshToken: new SupabaseRefreshTokenRepository(),
                namTuyenSinh: new SupabaseNamTuyenSinhRepository(),
                dotTuyenSinh: new SupabaseDotTuyenSinhRepository(),
                nganhDangKy: new SupabaseNganhDangKyRepository(),
                heDaoTao: new SupabaseHeDaoTaoRepository(),
                sinhVien: new SupabaseSinhVienRepository(),
                hoSo: new SupabaseHoSoTuyenSinhRepository(),
                tepDinhKem: new SupabaseTepDinhKemRepository(),
                lichSu: new SupabaseLichSuCapNhatRepository(),
            };
        default:
            throw new Error(`Unknown DB_TYPE: ${dbType}. Supported: sqlite, supabase.`);
    }
}
export const repos = createRepositories();
