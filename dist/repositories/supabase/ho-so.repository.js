import { getSupabase } from "./client.js";
import { throwIfError } from "./error-map.js";
import { logQuery, logQueryError } from "../../logger.js";
/**
 * Supabase JOIN select — lồng objects theo FK.
 * Key alias phải khớp với FK constraint name do Supabase auto-detect.
 * Dùng tên bảng đích như một key để embed.
 */
const VIEW_SELECT = `
  maHoSo, maSinhVien, trangThai, ghiChu, ngayTao, ngayCapNhat,
  namTuyenSinhId, dotTuyenSinhId, nganhDangKyId, heDaoTaoId,
  NamTuyenSinh:namTuyenSinhId (nam),
  DotTuyenSinh:dotTuyenSinhId (tenDot),
  NganhDangKy:nganhDangKyId (tenNganh),
  HeDaoTao:heDaoTaoId (tenHe),
  SinhVien:maSinhVien (hoTen)
`;
function flatten(row) {
    return {
        maHoSo: row.maHoSo,
        maSinhVien: row.maSinhVien,
        namTuyenSinhId: row.namTuyenSinhId,
        dotTuyenSinhId: row.dotTuyenSinhId,
        nganhDangKyId: row.nganhDangKyId,
        heDaoTaoId: row.heDaoTaoId,
        namTuyenSinh: row.NamTuyenSinh?.nam,
        dotTuyenSinh: row.DotTuyenSinh?.tenDot,
        nganhDangKy: row.NganhDangKy?.tenNganh,
        heDaoTao: row.HeDaoTao?.tenHe,
        hoTen: row.SinhVien?.hoTen,
        trangThai: row.trangThai,
        ghiChu: row.ghiChu,
        ngayTao: row.ngayTao,
        ngayCapNhat: row.ngayCapNhat,
    };
}
export class SupabaseHoSoTuyenSinhRepository {
    async findAll(filters) {
        logQuery("SupabaseHoSoTuyenSinhRepository", "findAll", { filters });
        try {
            let query = getSupabase().from("HoSoTuyenSinh").select(VIEW_SELECT);
            if (filters.trangThai)
                query = query.eq("trangThai", filters.trangThai);
            if (filters.namTuyenSinhId)
                query = query.eq("namTuyenSinhId", Number(filters.namTuyenSinhId));
            if (filters.dotTuyenSinhId)
                query = query.eq("dotTuyenSinhId", Number(filters.dotTuyenSinhId));
            if (filters.nganhDangKyId)
                query = query.eq("nganhDangKyId", Number(filters.nganhDangKyId));
            const { data, error } = await query.order("ngayTao", { ascending: false });
            if (error)
                throwIfError(error);
            return (data || []).map(flatten);
        }
        catch (err) {
            logQueryError("SupabaseHoSoTuyenSinhRepository", "findAll", err);
            throw err;
        }
    }
    async findById(maHoSo) {
        logQuery("SupabaseHoSoTuyenSinhRepository", "findById", { maHoSo });
        try {
            const { data, error } = await getSupabase()
                .from("HoSoTuyenSinh")
                .select(VIEW_SELECT)
                .eq("maHoSo", maHoSo)
                .maybeSingle();
            if (error)
                throwIfError(error);
            return data ? flatten(data) : null;
        }
        catch (err) {
            logQueryError("SupabaseHoSoTuyenSinhRepository", "findById", err);
            throw err;
        }
    }
    async findRawById(maHoSo) {
        logQuery("SupabaseHoSoTuyenSinhRepository", "findRawById", { maHoSo });
        try {
            const { data, error } = await getSupabase()
                .from("HoSoTuyenSinh")
                .select("*")
                .eq("maHoSo", maHoSo)
                .maybeSingle();
            if (error)
                throwIfError(error);
            return data ?? null;
        }
        catch (err) {
            logQueryError("SupabaseHoSoTuyenSinhRepository", "findRawById", err);
            throw err;
        }
    }
    async create(data) {
        logQuery("SupabaseHoSoTuyenSinhRepository", "create", { data });
        try {
            // Atomic: gọi RPC `tao_ho_so` (xem `db/supabase-schema.sql`).
            // Function chạy advisory lock + sinh ma + INSERT trong cùng tx →
            // 2 request đồng thời không thể đụng nhau.
            const { data: row, error } = await getSupabase().rpc("tao_ho_so", {
                p_ma_sinh_vien: data.maSinhVien,
                p_nam_tuyen_sinh_id: data.namTuyenSinhId,
                p_dot_tuyen_sinh_id: data.dotTuyenSinhId,
                p_nganh_dang_ky_id: data.nganhDangKyId,
                p_he_dao_tao_id: data.heDaoTaoId,
                p_ghi_chu: data.ghiChu ?? null,
            });
            if (error)
                throwIfError(error);
            // RPC returns a single row { maHoSo: '...' }
            const maHoSo = row?.maHoSo ??
                (Array.isArray(row) ? row[0]?.maHoSo : null);
            if (!maHoSo) {
                throw new Error("RPC tao_ho_so không trả về maHoSo");
            }
            return (await this.findById(maHoSo));
        }
        catch (err) {
            logQueryError("SupabaseHoSoTuyenSinhRepository", "create", err);
            throw err;
        }
    }
    async updateTrangThai(maHoSo, trangThai, ghiChu) {
        logQuery("SupabaseHoSoTuyenSinhRepository", "updateTrangThai", {
            maHoSo,
            trangThai,
            ghiChu,
        });
        try {
            const { error } = await getSupabase()
                .from("HoSoTuyenSinh")
                .update({
                trangThai,
                ghiChu,
                ngayCapNhat: new Date().toISOString(),
            })
                .eq("maHoSo", maHoSo);
            if (error)
                throwIfError(error);
            return (await this.findById(maHoSo));
        }
        catch (err) {
            logQueryError("SupabaseHoSoTuyenSinhRepository", "updateTrangThai", err);
            throw err;
        }
    }
    async thongKe() {
        logQuery("SupabaseHoSoTuyenSinhRepository", "thongKe", {});
        try {
            // Supabase không có GROUP BY trực tiếp qua REST API.
            // Cách đơn giản: đếm từng trạng thái bằng head=true + count=exact.
            const supabase = getSupabase();
            const statuses = [
                { key: "moiNop", value: "moi_nop" },
                { key: "dangKiemTra", value: "dang_kiem_tra" },
                { key: "thieuGiayTo", value: "thieu_giay_to" },
                { key: "hoanTat", value: "hoan_tat" },
                { key: "tuChoi", value: "tu_choi" },
            ];
            const [totalRes, ...results] = await Promise.all([
                supabase.from("HoSoTuyenSinh").select("*", { count: "exact", head: true }),
                ...statuses.map((s) => supabase
                    .from("HoSoTuyenSinh")
                    .select("*", { count: "exact", head: true })
                    .eq("trangThai", s.value)),
            ]);
            if (totalRes.error)
                throwIfError(totalRes.error);
            const stats = {
                total: totalRes.count ?? 0,
                moiNop: 0,
                dangKiemTra: 0,
                thieuGiayTo: 0,
                hoanTat: 0,
                tuChoi: 0,
            };
            results.forEach((res, i) => {
                if (res.error)
                    throwIfError(res.error);
                stats[statuses[i].key] = res.count ?? 0;
            });
            return stats;
        }
        catch (err) {
            logQueryError("SupabaseHoSoTuyenSinhRepository", "thongKe", err);
            throw err;
        }
    }
}
