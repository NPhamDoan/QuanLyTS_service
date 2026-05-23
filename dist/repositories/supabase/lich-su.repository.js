import { randomUUID } from "crypto";
import { getSupabase } from "./client.js";
import { throwIfError } from "./error-map.js";
import { logQuery, logQueryError } from "../../logger.js";
export class SupabaseLichSuCapNhatRepository {
    async findByMaHoSo(maHoSo) {
        logQuery("SupabaseLichSuCapNhatRepository", "findByMaHoSo", { maHoSo });
        try {
            const { data, error } = await getSupabase()
                .from("LichSuCapNhat")
                .select(`
        id, maHoSo, trangThaiCu, trangThaiMoi, ghiChu, thoiGian,
        TaiKhoan:nguoiThucHienId (hoTen)
      `)
                .eq("maHoSo", maHoSo)
                .order("thoiGian", { ascending: false })
                .limit(100);
            if (error)
                throwIfError(error);
            return (data || []).map((row) => ({
                id: row.id,
                maHoSo: row.maHoSo,
                trangThaiCu: row.trangThaiCu,
                trangThaiMoi: row.trangThaiMoi,
                ghiChu: row.ghiChu,
                nguoiThucHien: row.TaiKhoan?.hoTen ?? "Không rõ",
                thoiGian: row.thoiGian,
            }));
        }
        catch (err) {
            logQueryError("SupabaseLichSuCapNhatRepository", "findByMaHoSo", err);
            throw err;
        }
    }
    async create(data) {
        logQuery("SupabaseLichSuCapNhatRepository", "create", { data });
        try {
            const id = randomUUID();
            const thoiGian = new Date().toISOString();
            const { error } = await getSupabase().from("LichSuCapNhat").insert({
                id,
                maHoSo: data.maHoSo,
                trangThaiCu: data.trangThaiCu,
                trangThaiMoi: data.trangThaiMoi,
                ghiChu: data.ghiChu,
                nguoiThucHienId: data.nguoiThucHienId,
                thoiGian,
            });
            if (error)
                throwIfError(error);
            return {
                id,
                maHoSo: data.maHoSo,
                trangThaiCu: data.trangThaiCu,
                trangThaiMoi: data.trangThaiMoi,
                ghiChu: data.ghiChu,
                nguoiThucHienId: data.nguoiThucHienId,
                thoiGian,
            };
        }
        catch (err) {
            logQueryError("SupabaseLichSuCapNhatRepository", "create", err);
            throw err;
        }
    }
    async capNhatTrangThaiVaGhiLichSu(data) {
        logQuery("SupabaseLichSuCapNhatRepository", "capNhatTrangThaiVaGhiLichSu", {
            data,
        });
        try {
            const { error } = await getSupabase().rpc("cap_nhat_trang_thai_va_ghi_lich_su", {
                p_ma_ho_so: data.maHoSo,
                p_trang_thai_cu: data.trangThaiCu,
                p_trang_thai_moi: data.trangThaiMoi,
                p_ghi_chu: data.ghiChu,
                p_nguoi_thuc_hien_id: data.nguoiThucHienId,
            });
            if (error)
                throwIfError(error);
        }
        catch (err) {
            logQueryError("SupabaseLichSuCapNhatRepository", "capNhatTrangThaiVaGhiLichSu", err);
            throw err;
        }
    }
}
