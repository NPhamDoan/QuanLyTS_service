import { randomUUID } from "crypto";
import { getDb } from "./client.js";
import { logQuery, logQueryError } from "../../logger.js";
export class SqliteTepDinhKemRepository {
    async findById(maTep) {
        logQuery("SqliteTepDinhKemRepository", "findById", { maTep });
        try {
            return (getDb()
                .prepare("SELECT * FROM TepDinhKem WHERE maTep = ?")
                .get(maTep) || null);
        }
        catch (err) {
            logQueryError("SqliteTepDinhKemRepository", "findById", err);
            throw err;
        }
    }
    async findByHoSo(maHoSo) {
        logQuery("SqliteTepDinhKemRepository", "findByHoSo", { maHoSo });
        try {
            return getDb()
                .prepare("SELECT * FROM TepDinhKem WHERE maHoSo = ?")
                .all(maHoSo);
        }
        catch (err) {
            logQueryError("SqliteTepDinhKemRepository", "findByHoSo", err);
            throw err;
        }
    }
    async create(data) {
        logQuery("SqliteTepDinhKemRepository", "create", { data });
        try {
            const maTep = randomUUID();
            getDb()
                .prepare("INSERT INTO TepDinhKem (maTep, maHoSo, tenTep, duongDan, loaiTep) VALUES (?, ?, ?, ?, ?)")
                .run(maTep, data.maHoSo, data.tenTep, data.duongDan, data.loaiTep);
            return { maTep, ...data };
        }
        catch (err) {
            logQueryError("SqliteTepDinhKemRepository", "create", err);
            throw err;
        }
    }
    async delete(maTep) {
        logQuery("SqliteTepDinhKemRepository", "delete", { maTep });
        try {
            getDb().prepare("DELETE FROM TepDinhKem WHERE maTep = ?").run(maTep);
        }
        catch (err) {
            logQueryError("SqliteTepDinhKemRepository", "delete", err);
            throw err;
        }
    }
}
