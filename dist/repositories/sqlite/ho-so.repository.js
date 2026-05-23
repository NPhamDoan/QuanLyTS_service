import { getDb } from "./client.js";
import { logQuery, logQueryError } from "../../logger.js";
/**
 * Sinh mã hồ sơ chạy trong cùng transaction với INSERT để tránh race
 * condition: 2 request đồng thời cùng đọc MAX rồi cả hai đều +1.
 *
 * SQLite (better-sqlite3) serialize writes ở mức database — `BEGIN
 * IMMEDIATE` (mặc định khi dùng `db.transaction()`) lấy lock để 2 write
 * không chạy song song. Việc bọc generate + insert vào cùng tx đảm bảo
 * mã được tính từ snapshot DB tại thời điểm tx bắt đầu, không bị "stale
 * read".
 *
 * Hàm này KHÔNG được gọi ngoài transaction — chỉ dùng nội bộ trong
 * `create`.
 */
function generateMaHoSoInTx() {
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
        logQuery("SqliteHoSoTuyenSinhRepository", "findAll", { filters });
        try {
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
        catch (err) {
            logQueryError("SqliteHoSoTuyenSinhRepository", "findAll", err);
            throw err;
        }
    }
    async findById(maHoSo) {
        logQuery("SqliteHoSoTuyenSinhRepository", "findById", { maHoSo });
        try {
            const row = getDb()
                .prepare(VIEW_SELECT + " WHERE h.maHoSo = ?")
                .get(maHoSo);
            return row ?? null;
        }
        catch (err) {
            logQueryError("SqliteHoSoTuyenSinhRepository", "findById", err);
            throw err;
        }
    }
    async findRawById(maHoSo) {
        logQuery("SqliteHoSoTuyenSinhRepository", "findRawById", { maHoSo });
        try {
            const row = getDb()
                .prepare("SELECT * FROM HoSoTuyenSinh WHERE maHoSo = ?")
                .get(maHoSo);
            return row ?? null;
        }
        catch (err) {
            logQueryError("SqliteHoSoTuyenSinhRepository", "findRawById", err);
            throw err;
        }
    }
    async create(data) {
        logQuery("SqliteHoSoTuyenSinhRepository", "create", { data });
        try {
            const now = new Date().toISOString();
            const db = getDb();
            // Bọc generate + insert trong 1 transaction để tránh race:
            // SELECT MAX và INSERT phải nằm trong cùng 1 tx (BEGIN IMMEDIATE)
            // để đảm bảo không có 2 request cùng đọc snapshot rồi cả hai INSERT.
            const runTx = db.transaction((input) => {
                const maHoSo = generateMaHoSoInTx();
                db.prepare(`INSERT INTO HoSoTuyenSinh (
             maHoSo, maSinhVien, namTuyenSinhId, dotTuyenSinhId, nganhDangKyId, heDaoTaoId,
             trangThai, ghiChu, ngayTao, ngayCapNhat
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(maHoSo, input.maSinhVien, input.namTuyenSinhId, input.dotTuyenSinhId, input.nganhDangKyId, input.heDaoTaoId, "moi_nop", input.ghiChu ?? null, now, now);
                return maHoSo;
            });
            const maHoSo = runTx(data);
            return (await this.findById(maHoSo));
        }
        catch (err) {
            logQueryError("SqliteHoSoTuyenSinhRepository", "create", err);
            throw err;
        }
    }
    async updateTrangThai(maHoSo, trangThai, ghiChu) {
        logQuery("SqliteHoSoTuyenSinhRepository", "updateTrangThai", {
            maHoSo,
            trangThai,
            ghiChu,
        });
        try {
            const now = new Date().toISOString();
            getDb()
                .prepare("UPDATE HoSoTuyenSinh SET trangThai = ?, ghiChu = ?, ngayCapNhat = ? WHERE maHoSo = ?")
                .run(trangThai, ghiChu, now, maHoSo);
            return (await this.findById(maHoSo));
        }
        catch (err) {
            logQueryError("SqliteHoSoTuyenSinhRepository", "updateTrangThai", err);
            throw err;
        }
    }
    async thongKe() {
        logQuery("SqliteHoSoTuyenSinhRepository", "thongKe", {});
        try {
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
        catch (err) {
            logQueryError("SqliteHoSoTuyenSinhRepository", "thongKe", err);
            throw err;
        }
    }
}
