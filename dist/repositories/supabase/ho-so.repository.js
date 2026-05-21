import { getSupabase } from "./client.js";
import { throwIfError } from "./error-map.js";
async function generateMaHoSo() {
    const year = new Date().getFullYear();
    const prefix = `HS-${year}`;
    const { data, error } = await getSupabase()
        .from("HoSoTuyenSinh")
        .select("maHoSo")
        .like("maHoSo", `${prefix}%`)
        .order("maHoSo", { ascending: false })
        .limit(1);
    if (error)
        throwIfError(error);
    let seq = 1;
    if (data && data.length > 0) {
        const last = data[0].maHoSo;
        const lastSeq = parseInt(last.slice(prefix.length), 10);
        if (!isNaN(lastSeq))
            seq = lastSeq + 1;
    }
    return `${prefix}${String(seq).padStart(4, "0")}`;
}
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
    async findById(maHoSo) {
        const { data, error } = await getSupabase()
            .from("HoSoTuyenSinh")
            .select(VIEW_SELECT)
            .eq("maHoSo", maHoSo)
            .maybeSingle();
        if (error)
            throwIfError(error);
        return data ? flatten(data) : null;
    }
    async findRawById(maHoSo) {
        const { data, error } = await getSupabase()
            .from("HoSoTuyenSinh")
            .select("*")
            .eq("maHoSo", maHoSo)
            .maybeSingle();
        if (error)
            throwIfError(error);
        return data ?? null;
    }
    async create(data) {
        const maHoSo = await generateMaHoSo();
        const now = new Date().toISOString();
        const { error } = await getSupabase().from("HoSoTuyenSinh").insert({
            maHoSo,
            maSinhVien: data.maSinhVien,
            namTuyenSinhId: data.namTuyenSinhId,
            dotTuyenSinhId: data.dotTuyenSinhId,
            nganhDangKyId: data.nganhDangKyId,
            heDaoTaoId: data.heDaoTaoId,
            trangThai: "moi_nop",
            ghiChu: data.ghiChu ?? null,
            ngayTao: now,
            ngayCapNhat: now,
        });
        if (error)
            throwIfError(error);
        return (await this.findById(maHoSo));
    }
    async updateTrangThai(maHoSo, trangThai, ghiChu) {
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
    async thongKe() {
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
}
