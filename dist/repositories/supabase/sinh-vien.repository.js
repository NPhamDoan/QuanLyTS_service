import { getSupabase } from "./client.js";
import { throwIfError } from "./error-map.js";
import { logQuery, logQueryError } from "../../logger.js";
export class SupabaseSinhVienRepository {
    async findById(maSinhVien) {
        logQuery("SupabaseSinhVienRepository", "findById", { maSinhVien });
        try {
            const supabase = getSupabase();
            const { data, error } = await supabase
                .from("SinhVien")
                .select("*")
                .eq("maSinhVien", maSinhVien)
                .maybeSingle();
            if (error)
                throwIfError(error);
            return data ?? null;
        }
        catch (err) {
            logQueryError("SupabaseSinhVienRepository", "findById", err);
            throw err;
        }
    }
    async create(data) {
        logQuery("SupabaseSinhVienRepository", "create", { data });
        try {
            // Atomic: gọi RPC `tao_sinh_vien` (xem `db/supabase-schema.sql`).
            // Function chạy advisory lock + sinh maSinhVien + INSERT trong cùng tx.
            const supabase = getSupabase();
            const { data: row, error } = await supabase.rpc("tao_sinh_vien", {
                p_ho_ten: data.hoTen,
                p_ngay_sinh: data.ngaySinh,
                p_gioi_tinh: data.gioiTinh,
                p_cccd: data.cccd,
                p_email: data.email,
                p_so_dien_thoai: data.soDienThoai,
                p_dia_chi: data.diaChi,
            });
            if (error)
                throwIfError(error);
            // RPC returns SETOF SinhVien — lấy row đầu.
            const sv = Array.isArray(row) ? row[0] : row;
            if (!sv)
                throw new Error("RPC tao_sinh_vien không trả về row");
            return sv;
        }
        catch (err) {
            logQueryError("SupabaseSinhVienRepository", "create", err);
            throw err;
        }
    }
    async updateAvatar(maSinhVien, anhDaiDien) {
        logQuery("SupabaseSinhVienRepository", "updateAvatar", { maSinhVien, anhDaiDien });
        try {
            const supabase = getSupabase();
            const { error } = await supabase
                .from("SinhVien")
                .update({ anhDaiDien })
                .eq("maSinhVien", maSinhVien);
            if (error)
                throwIfError(error);
        }
        catch (err) {
            logQueryError("SupabaseSinhVienRepository", "updateAvatar", err);
            throw err;
        }
    }
}
