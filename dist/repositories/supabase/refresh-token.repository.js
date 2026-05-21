import { getSupabase } from "./client.js";
import { throwIfError } from "./error-map.js";
export class SupabaseRefreshTokenRepository {
    async create(taiKhoanId, tokenHash, hetHan) {
        const supabase = getSupabase();
        const { error } = await supabase.from("RefreshToken").insert({
            taiKhoanId,
            tokenHash,
            hetHan,
            ngayTao: new Date().toISOString(),
        });
        if (error)
            throwIfError(error);
    }
    async findByHash(tokenHash) {
        const supabase = getSupabase();
        // JOIN với TaiKhoan qua FK relationship (Supabase tự detect nếu có FK
        // trong schema). Kết quả trả về object lồng `TaiKhoan`.
        const { data, error } = await supabase
            .from("RefreshToken")
            .select(`id, taiKhoanId, tokenHash, hetHan, ngayTao,
         TaiKhoan:taiKhoanId (tenDangNhap, hoTen, vaiTro, trangThai)`)
            .eq("tokenHash", tokenHash)
            .maybeSingle();
        if (error)
            throwIfError(error);
        if (!data)
            return null;
        const user = data.TaiKhoan;
        if (!user)
            return null;
        return {
            id: data.id,
            taiKhoanId: data.taiKhoanId,
            tokenHash: data.tokenHash,
            hetHan: data.hetHan,
            ngayTao: data.ngayTao,
            tenDangNhap: user.tenDangNhap,
            hoTen: user.hoTen,
            vaiTro: user.vaiTro,
            trangThaiTaiKhoan: user.trangThai,
        };
    }
    async deleteById(id) {
        const supabase = getSupabase();
        const { error } = await supabase.from("RefreshToken").delete().eq("id", id);
        if (error)
            throwIfError(error);
    }
    async deleteByHash(tokenHash) {
        const supabase = getSupabase();
        const { error } = await supabase
            .from("RefreshToken")
            .delete()
            .eq("tokenHash", tokenHash);
        if (error)
            throwIfError(error);
    }
    async deleteAllByTaiKhoanId(taiKhoanId) {
        const supabase = getSupabase();
        const { error } = await supabase
            .from("RefreshToken")
            .delete()
            .eq("taiKhoanId", taiKhoanId);
        if (error)
            throwIfError(error);
    }
}
