import { getSupabase } from "./client.js";
import { throwIfError } from "./error-map.js";
import { NotFoundError } from "../../domain/errors.js";
const PUBLIC_COLS = "id, tenDangNhap, hoTen, vaiTro, trangThai, ngayTao, ngayCapNhat";
export class SupabaseTaiKhoanRepository {
    async findAll() {
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from("TaiKhoan")
            .select(PUBLIC_COLS)
            .order("id");
        if (error)
            throwIfError(error);
        return data || [];
    }
    async findById(id) {
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from("TaiKhoan")
            .select("*")
            .eq("id", id)
            .maybeSingle();
        if (error)
            throwIfError(error);
        return data ?? null;
    }
    async findByTenDangNhap(tenDangNhap) {
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from("TaiKhoan")
            .select("*")
            .eq("tenDangNhap", tenDangNhap)
            .maybeSingle();
        if (error)
            throwIfError(error);
        return data ?? null;
    }
    async count() {
        const supabase = getSupabase();
        const { count, error } = await supabase
            .from("TaiKhoan")
            .select("*", { count: "exact", head: true });
        if (error)
            throwIfError(error);
        return count ?? 0;
    }
    async create(data) {
        const supabase = getSupabase();
        const now = new Date().toISOString();
        const { data: inserted, error } = await supabase
            .from("TaiKhoan")
            .insert({
            tenDangNhap: data.tenDangNhap,
            matKhauHash: data.matKhauHash,
            hoTen: data.hoTen,
            vaiTro: data.vaiTro,
            trangThai: "hoat_dong",
            ngayTao: now,
            ngayCapNhat: now,
        })
            .select(PUBLIC_COLS)
            .single();
        if (error)
            throwIfError(error, { conflict: "Tên đăng nhập đã tồn tại" });
        return inserted;
    }
    async update(id, data) {
        const existing = await this.findById(id);
        if (!existing)
            throw new NotFoundError("tài khoản");
        const updates = { ngayCapNhat: new Date().toISOString() };
        if (data.hoTen !== undefined)
            updates.hoTen = data.hoTen;
        if (data.vaiTro !== undefined)
            updates.vaiTro = data.vaiTro;
        const supabase = getSupabase();
        const { data: updated, error } = await supabase
            .from("TaiKhoan")
            .update(updates)
            .eq("id", id)
            .select(PUBLIC_COLS)
            .single();
        if (error)
            throwIfError(error);
        return updated;
    }
    async updateMatKhau(id, matKhauHash) {
        const existing = await this.findById(id);
        if (!existing)
            throw new NotFoundError("tài khoản");
        const supabase = getSupabase();
        const { error } = await supabase
            .from("TaiKhoan")
            .update({ matKhauHash, ngayCapNhat: new Date().toISOString() })
            .eq("id", id);
        if (error)
            throwIfError(error);
    }
    async updateTrangThai(id, trangThai) {
        const existing = await this.findById(id);
        if (!existing)
            throw new NotFoundError("tài khoản");
        const supabase = getSupabase();
        const { data: updated, error } = await supabase
            .from("TaiKhoan")
            .update({ trangThai, ngayCapNhat: new Date().toISOString() })
            .eq("id", id)
            .select(PUBLIC_COLS)
            .single();
        if (error)
            throwIfError(error);
        return updated;
    }
}
