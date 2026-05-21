import { getDb } from "./client.js";
function generateMaHoSo() {
    const year = new Date().getFullYear();
    const prefix = `HS-${year}`;
    const row = getDb()
        .prepare("SELECT maHoSo FROM HoSoTuyenSinh WHERE maHoSo LIKE ? ORDER BY maHoSo DESC LIMIT 1")
        .get(`${prefix}%`);
    let seq = 1;
    if (row) {
        const lastSeq = parseInt(row.maHoSo.slice(prefix.length), 10);
        if (!isNaN(lastSeq))
            seq = lastSeq + 1;
    }
    return `${prefix}${String(seq).padStart(4, "0")}`;
}
const VIEW_SELECT = `
  SELECT
    h.maHoSo, h.maSinhVien, h.trangThai, h.ghiChu, h.ngayTao, h.ngayCapNhat,
    h.namTuyenSinhId, h.dotTuyenSinhId, h.nganhDangKyId, h.heDaoTaoId,
    n.nam AS namTuyenSinh,
    d.tenDot AS dotTuyenSinh,
    ng.tenNganh AS nganhDangKy,
    he.tenHe AS heDaoTao,
    sv.hoTen AS hoTen
  FROM HoSoTuyenSinh h
  JOIN NamTuyenSinh n ON h.namTuyenSinhId = n.id
  JOIN DotTuyenSinh d ON h.dotTuyenSinhId = d.id
  JOIN NganhDangKy ng ON h.nganhDangKyId = ng.id
  JOIN HeDaoTao he ON h.heDaoTaoId = he.id
  JOIN SinhVien sv ON h.maSinhVien = sv.maSinhVien
`;
export class SqliteHoSoTuyenSinhRepository {
    async findAll(filters) {
        let query = VIEW_SELECT + " WHERE 1=1";
        const params = [];
        if (filters.trangThai) {
            query += " AND h.trangThai = ?";
            params.push(filters.trangThai);
        }
        if (filters.nganhDangKyId) {
            query += " AND h.nganhDangKyId = ?";
            params.push(Number(filters.nganhDangKyId));
        }
        if (filters.dotTuyenSinhId) {
            query += " AND h.dotTuyenSinhId = ?";
            params.push(Number(filters.dotTuyenSinhId));
        }
        if (filters.namTuyenSinhId) {
            query += " AND h.namTuyenSinhId = ?";
            params.push(Number(filters.namTuyenSinhId));
        }
        query += " ORDER BY h.ngayTao DESC";
        return getDb().prepare(query).all(...params);
    }
    async findById(maHoSo) {
        const row = getDb()
            .prepare(VIEW_SELECT + " WHERE h.maHoSo = ?")
            .get(maHoSo);
        return row ?? null;
    }
    async findRawById(maHoSo) {
        const row = getDb()
            .prepare("SELECT * FROM HoSoTuyenSinh WHERE maHoSo = ?")
            .get(maHoSo);
        return row ?? null;
    }
    async create(data) {
        const maHoSo = generateMaHoSo();
        const now = new Date().toISOString();
        getDb()
            .prepare(`INSERT INTO HoSoTuyenSinh (
           maHoSo, maSinhVien, namTuyenSinhId, dotTuyenSinhId, nganhDangKyId, heDaoTaoId,
           trangThai, ghiChu, ngayTao, ngayCapNhat
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
            .run(maHoSo, data.maSinhVien, data.namTuyenSinhId, data.dotTuyenSinhId, data.nganhDangKyId, data.heDaoTaoId, "moi_nop", data.ghiChu ?? null, now, now);
        return (await this.findById(maHoSo));
    }
    async updateTrangThai(maHoSo, trangThai, ghiChu) {
        const now = new Date().toISOString();
        getDb()
            .prepare("UPDATE HoSoTuyenSinh SET trangThai = ?, ghiChu = ?, ngayCapNhat = ? WHERE maHoSo = ?")
            .run(trangThai, ghiChu, now, maHoSo);
        return (await this.findById(maHoSo));
    }
    async thongKe() {
        const rows = getDb()
            .prepare("SELECT trangThai, COUNT(*) AS count FROM HoSoTuyenSinh GROUP BY trangThai")
            .all();
        const stats = {
            total: 0,
            moiNop: 0,
            dangKiemTra: 0,
            thieuGiayTo: 0,
            hoanTat: 0,
            tuChoi: 0,
        };
        const keyMap = {
            moi_nop: "moiNop",
            dang_kiem_tra: "dangKiemTra",
            thieu_giay_to: "thieuGiayTo",
            hoan_tat: "hoanTat",
            tu_choi: "tuChoi",
        };
        for (const row of rows) {
            stats.total += row.count;
            const key = keyMap[row.trangThai];
            if (key)
                stats[key] = row.count;
        }
        return stats;
    }
}
