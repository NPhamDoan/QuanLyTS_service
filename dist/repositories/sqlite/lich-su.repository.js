import { randomUUID } from "crypto";
import { getDb } from "./client.js";
export class SqliteLichSuCapNhatRepository {
    async findByMaHoSo(maHoSo) {
        const rows = getDb()
            .prepare(`SELECT ls.id, ls.maHoSo, ls.trangThaiCu, ls.trangThaiMoi, ls.ghiChu,
                tk.hoTen AS nguoiThucHien, ls.thoiGian
         FROM LichSuCapNhat ls
         JOIN TaiKhoan tk ON ls.nguoiThucHienId = tk.id
         WHERE ls.maHoSo = ?
         ORDER BY ls.thoiGian DESC
         LIMIT 100`)
            .all(maHoSo);
        return rows;
    }
    async create(data) {
        const id = randomUUID();
        const thoiGian = new Date().toISOString();
        getDb()
            .prepare(`INSERT INTO LichSuCapNhat (id, maHoSo, trangThaiCu, trangThaiMoi, ghiChu, nguoiThucHienId, thoiGian)
         VALUES (?, ?, ?, ?, ?, ?, ?)`)
            .run(id, data.maHoSo, data.trangThaiCu, data.trangThaiMoi, data.ghiChu, data.nguoiThucHienId, thoiGian);
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
    async capNhatTrangThaiVaGhiLichSu(data) {
        const now = new Date().toISOString();
        const lichSuId = randomUUID();
        const run = getDb().transaction(() => {
            getDb()
                .prepare("UPDATE HoSoTuyenSinh SET trangThai = ?, ghiChu = ?, ngayCapNhat = ? WHERE maHoSo = ?")
                .run(data.trangThaiMoi, data.ghiChu, now, data.maHoSo);
            getDb()
                .prepare(`INSERT INTO LichSuCapNhat (id, maHoSo, trangThaiCu, trangThaiMoi, ghiChu, nguoiThucHienId, thoiGian)
           VALUES (?, ?, ?, ?, ?, ?, ?)`)
                .run(lichSuId, data.maHoSo, data.trangThaiCu, data.trangThaiMoi, data.ghiChu, data.nguoiThucHienId, now);
        });
        run();
    }
}
