import path from "path";
import fs from "fs";
import { layDanhSachTepTheoHoSo, themTepDinhKem, xoaTepDinhKem, layTepTheoId, } from "../services/tepdinhkem.service.js";
import { toHttpStatus } from "../domain/errors.js";
import { privateDir } from "../utils/storage.js";
function sendError(res, err, fallback) {
    const { status, message } = toHttpStatus(err);
    res.status(status).json({ error: message || fallback });
}
export const uploadTepHandler = async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: "Không có tệp nào được tải lên" });
        }
        const { maHoSo } = req.body;
        if (!maHoSo) {
            return res.status(400).json({ error: "Thiếu mã hồ sơ" });
        }
        const tep = await themTepDinhKem({
            maHoSo,
            tenTep: file.originalname,
            duongDan: `/private/${file.filename}`,
            loaiTep: file.mimetype,
        });
        res.status(201).json(tep);
    }
    catch (err) {
        sendError(res, err, "Không thể tải lên tệp đính kèm");
    }
};
export const layTepTheoHoSoHandler = async (req, res) => {
    try {
        const maHoSo = req.params.maHoSo;
        if (typeof maHoSo !== "string") {
            return res.status(400).json({ error: "Mã hồ sơ không hợp lệ" });
        }
        res.json(await layDanhSachTepTheoHoSo(maHoSo));
    }
    catch (err) {
        sendError(res, err, "Không thể lấy danh sách tệp");
    }
};
export const xoaTepHandler = async (req, res) => {
    try {
        const maTep = req.params.maTep;
        if (typeof maTep !== "string") {
            return res.status(400).json({ error: "Mã tệp không hợp lệ" });
        }
        res.json(await xoaTepDinhKem(maTep));
    }
    catch (err) {
        sendError(res, err, "Không thể xóa tệp");
    }
};
export const downloadTepHandler = async (req, res) => {
    try {
        const maTep = req.params.maTep;
        if (typeof maTep !== "string") {
            return res.status(400).json({ error: "Mã tệp không hợp lệ" });
        }
        const tep = await layTepTheoId(maTep);
        if (!tep) {
            return res.status(404).json({ error: "Không tìm thấy tệp đính kèm" });
        }
        // duongDan stored as "/private/filename.ext"
        const filename = path.basename(tep.duongDan);
        const absolutePath = path.join(privateDir, filename);
        if (!fs.existsSync(absolutePath)) {
            return res.status(404).json({ error: "File không tồn tại trên server" });
        }
        res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(tep.tenTep)}"`);
        res.sendFile(absolutePath);
    }
    catch (err) {
        sendError(res, err, "Không thể tải tệp");
    }
};
