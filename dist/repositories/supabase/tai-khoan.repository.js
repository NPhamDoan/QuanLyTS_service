import { getSupabase } from "./client.js";
import { throwIfError } from "./error-map.js";
import { logQuery, logQueryError } from "../../logger.js";
import { NotFoundError } from "../../domain/errors.js";
const PUBLIC_COLS = "id, tenDangNhap, hoTen, vaiTro, trangThai, ngayTao, ngayCapNhat";
export class SupabaseTaiKhoanRepository {
    async findAll() {
        logQuery("SupabaseTaiKhoanRepository", "findAll", {});
        try {
            const supabase = getSupabase();
            const { data, error } = await supabase
                .from("TaiKhoan")
                .select(PUBLIC_COLS)
                .order("id");
            if (error)
                throwIfError(error);
            return data || [];
        }
        catch (err) {
            logQueryError("SupabaseTaiKhoanRepository", "findAll", err);
            throw err;
        }
    }
    async findById(id) {
        logQuery("SupabaseTaiKhoanRepository", "findById", { id });
        try {
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
        catch (err) {
            logQueryError("SupabaseTaiKhoanRepository", "findById", err);
            throw err;
        }
    }
    async findByTenDangNhap(tenDangNhap) {
        logQuery("SupabaseTaiKhoanRepository", "findByTenDangNhap", { tenDangNhap });
        try {
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
        catch (err) {
            logQueryError("SupabaseTaiKhoanRepository", "findByTenDangNhap", err);
            throw err;
        }
    }
    async count() {
        logQuery("SupabaseTaiKhoanRepository", "count", {});
        try {
            const supabase = getSupabase();
            const { count, error } = await supabase
                .from("TaiKhoan")
                .select("*", { count: "exact", head: true });
            if (error)
                throwIfError(error);
            return count ?? 0;
        }
        catch (err) {
            logQueryError("SupabaseTaiKhoanRepository", "count", err);
            throw err;
        }
    }
    async create(data) {
        logQuery("SupabaseTaiKhoanRepository", "create", { data });
        try {
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
        catch (err) {
            logQueryError("SupabaseTaiKhoanRepository", "create", err);
            throw err;
        }
    }
    async update(id, data) {
        logQuery("SupabaseTaiKhoanRepository", "update", { id, data });
        try {
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
        catch (err) {
            logQueryError("SupabaseTaiKhoanRepository", "update", err);
            throw err;
        }
    }
    async updateMatKhau(id, matKhauHash) {
        logQuery("SupabaseTaiKhoanRepository", "updateMatKhau", { id, matKhauHash });
        try {
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
        catch (err) {
            logQueryError("SupabaseTaiKhoanRepository", "updateMatKhau", err);
            throw err;
        }
    }
    async updateTrangThai(id, trangThai) {
        logQuery("SupabaseTaiKhoanRepository", "updateTrangThai", { id, trangThai });
        try {
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
        catch (err) {
            logQueryError("SupabaseTaiKhoanRepository", "updateTrangThai", err);
            throw err;
        }
    }
}
