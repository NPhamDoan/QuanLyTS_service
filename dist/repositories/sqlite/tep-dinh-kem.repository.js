import { randomUUID } from "crypto";
import { getDb } from "./client.js";
export class SqliteTepDinhKemRepository {
    async findById(maTep) {
        return (getDb()
            .prepare("SELECT * FROM TepDinhKem WHERE maTep = ?")
            .get(maTep) || null);
    }
    async findByHoSo(maHoSo) {
        return getDb()
            .prepare("SELECT * FROM TepDinhKem WHERE maHoSo = ?")
            .all(maHoSo);
    }
    async create(data) {
        const maTep = randomUUID();
        getDb()
            .prepare("INSERT INTO TepDinhKem (maTep, maHoSo, tenTep, duongDan, loaiTep) VALUES (?, ?, ?, ?, ?)")
            .run(maTep, data.maHoSo, data.tenTep, data.duongDan, data.loaiTep);
        return { maTep, ...data };
    }
    async delete(maTep) {
        getDb().prepare("DELETE FROM TepDinhKem WHERE maTep = ?").run(maTep);
    }
}
