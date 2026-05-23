import path from "path";
import fs from "fs";
import { repos } from "../repositories/index.js";
import { logger } from "../logger.js";
import { privateDir } from "../utils/storage.js";
export const themTepDinhKem = (data) => repos.tepDinhKem.create(data);
export const layDanhSachTepTheoHoSo = (maHoSo) => repos.tepDinhKem.findByHoSo(maHoSo);
export const layTepTheoId = (maTep) => repos.tepDinhKem.findById(maTep);
/**
 * Xóa tệp đính kèm: xóa DB row và xóa file vật lý trên disk.
 *
 * Quy trình:
 *  1. Lấy `duongDan` TRƯỚC khi xóa DB row.
 *  2. Xóa DB row (luôn ưu tiên consistency của DB).
 *  3. Best-effort xóa file vật lý — nếu fail (ENOENT / permission), log
 *     warning nhưng không throw vì DB đã update xong.
 *
 * Idempotent: nếu maTep không tồn tại trong DB, hàm return success
 * (không throw NotFoundError) — match hành vi cũ.
 */
export const xoaTepDinhKem = async (maTep) => {
    const tep = await repos.tepDinhKem.findById(maTep);
    await repos.tepDinhKem.delete(maTep);
    if (tep) {
        const filename = path.basename(tep.duongDan);
        const absolutePath = path.join(privateDir, filename);
        try {
            await fs.promises.unlink(absolutePath);
        }
        catch (err) {
            const e = err;
            // ENOENT = file đã không tồn tại — coi như đã xóa, im lặng.
            if (e.code !== "ENOENT") {
                logger.warn({ maTep, filename, errMessage: e.message }, "tepdinhkem.unlink_failed");
            }
        }
    }
    return { success: true, maTep };
};
