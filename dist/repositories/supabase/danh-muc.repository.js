import { getSupabase } from "./client.js";
import { throwIfError } from "./error-map.js";
import { NotFoundError } from "../../domain/errors.js";
// ============================================
// NamTuyenSinh
// ============================================
export class SupabaseNamTuyenSinhRepository {
    async findAll() {
        const { data, error } = await getSupabase()
            .from("NamTuyenSinh")
            .select("*")
            .order("nam", { ascending: false });
        if (error)
            throwIfError(error);
        return data || [];
    }
    async findAllActive() {
        const { data, error } = await getSupabase()
            .from("NamTuyenSinh")
            .select("*")
            .eq("trangThai", "hoat_dong")
            .order("nam", { ascending: false });
        if (error)
            throwIfError(error);
        return data || [];
    }
    async findById(id) {
        const { data, error } = await getSupabase()
            .from("NamTuyenSinh")
            .select("*")
            .eq("id", id)
            .maybeSingle();
        if (error)
            throwIfError(error);
        return data ?? null;
    }
    async create(data) {
        const now = new Date().toISOString();
        const { data: inserted, error } = await getSupabase()
            .from("NamTuyenSinh")
            .insert({
            nam: data.nam,
            trangThai: data.trangThai || "hoat_dong",
            ngayTao: now,
            ngayCapNhat: now,
        })
            .select("*")
            .single();
        if (error)
            throwIfError(error, { conflict: "Năm tuyển sinh đã tồn tại" });
        return inserted;
    }
    async update(id, data) {
        const existing = await this.findById(id);
        if (!existing)
            throw new NotFoundError("năm tuyển sinh");
        const updates = {
            ngayCapNhat: new Date().toISOString(),
        };
        if (data.nam !== undefined)
            updates.nam = data.nam;
        if (data.trangThai !== undefined)
            updates.trangThai = data.trangThai;
        const { data: updated, error } = await getSupabase()
            .from("NamTuyenSinh")
            .update(updates)
            .eq("id", id)
            .select("*")
            .single();
        if (error)
            throwIfError(error, { conflict: "Năm tuyển sinh đã tồn tại" });
        return updated;
    }
    async delete(id) {
        const existing = await this.findById(id);
        if (!existing)
            throw new NotFoundError("năm tuyển sinh");
        const { error } = await getSupabase()
            .from("NamTuyenSinh")
            .delete()
            .eq("id", id);
        if (error)
            throwIfError(error, {
                foreignKey: "Không thể xóa năm tuyển sinh đang được sử dụng",
            });
    }
}
// ============================================
// DotTuyenSinh (với JOIN để lấy tên năm)
// ============================================
function flattenDot(row) {
    return {
        id: row.id,
        tenDot: row.tenDot,
        namTuyenSinhId: row.namTuyenSinhId,
        namTuyenSinh: row.NamTuyenSinh?.nam,
        trangThai: row.trangThai,
        ngayTao: row.ngayTao,
        ngayCapNhat: row.ngayCapNhat,
    };
}
const DOT_SELECT_WITH_NAM = "*, NamTuyenSinh:namTuyenSinhId (nam)";
export class SupabaseDotTuyenSinhRepository {
    async findAll() {
        const { data, error } = await getSupabase()
            .from("DotTuyenSinh")
            .select(DOT_SELECT_WITH_NAM)
            .order("tenDot");
        if (error)
            throwIfError(error);
        return (data || []).map(flattenDot);
    }
    async findAllActive() {
        const { data, error } = await getSupabase()
            .from("DotTuyenSinh")
            .select(DOT_SELECT_WITH_NAM)
            .eq("trangThai", "hoat_dong")
            .order("tenDot");
        if (error)
            throwIfError(error);
        return (data || []).map(flattenDot);
    }
    async findById(id) {
        const { data, error } = await getSupabase()
            .from("DotTuyenSinh")
            .select(DOT_SELECT_WITH_NAM)
            .eq("id", id)
            .maybeSingle();
        if (error)
            throwIfError(error);
        return data ? flattenDot(data) : null;
    }
    async create(data) {
        const now = new Date().toISOString();
        const { data: inserted, error } = await getSupabase()
            .from("DotTuyenSinh")
            .insert({
            tenDot: data.tenDot,
            namTuyenSinhId: data.namTuyenSinhId,
            trangThai: data.trangThai || "hoat_dong",
            ngayTao: now,
            ngayCapNhat: now,
        })
            .select(DOT_SELECT_WITH_NAM)
            .single();
        if (error)
            throwIfError(error, {
                conflict: "Đợt tuyển sinh đã tồn tại trong năm này",
            });
        return flattenDot(inserted);
    }
    async update(id, data) {
        const existing = await this.findById(id);
        if (!existing)
            throw new NotFoundError("đợt tuyển sinh");
        const updates = {
            ngayCapNhat: new Date().toISOString(),
        };
        if (data.tenDot !== undefined)
            updates.tenDot = data.tenDot;
        if (data.namTuyenSinhId !== undefined)
            updates.namTuyenSinhId = data.namTuyenSinhId;
        if (data.trangThai !== undefined)
            updates.trangThai = data.trangThai;
        const { data: updated, error } = await getSupabase()
            .from("DotTuyenSinh")
            .update(updates)
            .eq("id", id)
            .select(DOT_SELECT_WITH_NAM)
            .single();
        if (error)
            throwIfError(error, {
                conflict: "Đợt tuyển sinh đã tồn tại trong năm này",
            });
        return flattenDot(updated);
    }
    async delete(id) {
        const existing = await this.findById(id);
        if (!existing)
            throw new NotFoundError("đợt tuyển sinh");
        const { error } = await getSupabase()
            .from("DotTuyenSinh")
            .delete()
            .eq("id", id);
        if (error)
            throwIfError(error, {
                foreignKey: "Không thể xóa đợt tuyển sinh đang được sử dụng",
            });
    }
}
// ============================================
// NganhDangKy
// ============================================
export class SupabaseNganhDangKyRepository {
    async findAll() {
        const { data, error } = await getSupabase()
            .from("NganhDangKy")
            .select("*")
            .order("tenNganh");
        if (error)
            throwIfError(error);
        return data || [];
    }
    async findAllActive() {
        const { data, error } = await getSupabase()
            .from("NganhDangKy")
            .select("*")
            .eq("trangThai", "hoat_dong")
            .order("tenNganh");
        if (error)
            throwIfError(error);
        return data || [];
    }
    async findById(id) {
        const { data, error } = await getSupabase()
            .from("NganhDangKy")
            .select("*")
            .eq("id", id)
            .maybeSingle();
        if (error)
            throwIfError(error);
        return data ?? null;
    }
    async create(data) {
        const now = new Date().toISOString();
        const { data: inserted, error } = await getSupabase()
            .from("NganhDangKy")
            .insert({
            tenNganh: data.tenNganh,
            maNganh: data.maNganh,
            trangThai: data.trangThai || "hoat_dong",
            ngayTao: now,
            ngayCapNhat: now,
        })
            .select("*")
            .single();
        if (error)
            throwIfError(error, { conflict: "Mã ngành đã tồn tại" });
        return inserted;
    }
    async update(id, data) {
        const existing = await this.findById(id);
        if (!existing)
            throw new NotFoundError("ngành đăng ký");
        const updates = {
            ngayCapNhat: new Date().toISOString(),
        };
        if (data.tenNganh !== undefined)
            updates.tenNganh = data.tenNganh;
        if (data.maNganh !== undefined)
            updates.maNganh = data.maNganh;
        if (data.trangThai !== undefined)
            updates.trangThai = data.trangThai;
        const { data: updated, error } = await getSupabase()
            .from("NganhDangKy")
            .update(updates)
            .eq("id", id)
            .select("*")
            .single();
        if (error)
            throwIfError(error, { conflict: "Mã ngành đã tồn tại" });
        return updated;
    }
    async delete(id) {
        const existing = await this.findById(id);
        if (!existing)
            throw new NotFoundError("ngành đăng ký");
        const { error } = await getSupabase()
            .from("NganhDangKy")
            .delete()
            .eq("id", id);
        if (error)
            throwIfError(error, {
                foreignKey: "Không thể xóa ngành đăng ký đang được sử dụng",
            });
    }
}
// ============================================
// HeDaoTao
// ============================================
export class SupabaseHeDaoTaoRepository {
    async findAll() {
        const { data, error } = await getSupabase()
            .from("HeDaoTao")
            .select("*")
            .order("tenHe");
        if (error)
            throwIfError(error);
        return data || [];
    }
    async findAllActive() {
        const { data, error } = await getSupabase()
            .from("HeDaoTao")
            .select("*")
            .eq("trangThai", "hoat_dong")
            .order("tenHe");
        if (error)
            throwIfError(error);
        return data || [];
    }
    async findById(id) {
        const { data, error } = await getSupabase()
            .from("HeDaoTao")
            .select("*")
            .eq("id", id)
            .maybeSingle();
        if (error)
            throwIfError(error);
        return data ?? null;
    }
    async create(data) {
        const now = new Date().toISOString();
        const { data: inserted, error } = await getSupabase()
            .from("HeDaoTao")
            .insert({
            tenHe: data.tenHe,
            trangThai: data.trangThai || "hoat_dong",
            ngayTao: now,
            ngayCapNhat: now,
        })
            .select("*")
            .single();
        if (error)
            throwIfError(error, { conflict: "Hệ đào tạo đã tồn tại" });
        return inserted;
    }
    async update(id, data) {
        const existing = await this.findById(id);
        if (!existing)
            throw new NotFoundError("hệ đào tạo");
        const updates = {
            ngayCapNhat: new Date().toISOString(),
        };
        if (data.tenHe !== undefined)
            updates.tenHe = data.tenHe;
        if (data.trangThai !== undefined)
            updates.trangThai = data.trangThai;
        const { data: updated, error } = await getSupabase()
            .from("HeDaoTao")
            .update(updates)
            .eq("id", id)
            .select("*")
            .single();
        if (error)
            throwIfError(error, { conflict: "Hệ đào tạo đã tồn tại" });
        return updated;
    }
    async delete(id) {
        const existing = await this.findById(id);
        if (!existing)
            throw new NotFoundError("hệ đào tạo");
        const { error } = await getSupabase()
            .from("HeDaoTao")
            .delete()
            .eq("id", id);
        if (error)
            throwIfError(error, {
                foreignKey: "Không thể xóa hệ đào tạo đang được sử dụng",
            });
    }
}
