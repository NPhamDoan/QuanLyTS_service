import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { taoHoSo, layDanhSachHoSo, layHoSoTheoId, capNhatTrangThai, layThongKe, layLichSu, } from "../services/hosotuyensinh.service.js";
import { capNhatAvatar } from "../services/sinhvien.service.js";
import { toHttpStatus } from "../domain/errors.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "..", "..", "uploads");
function sendError(res, err, fallback) {
    const { status, message } = toHttpStatus(err);
    res.status(status).json({ error: message || fallback });
}
export const taoHoSoHandler = async (req, res) => {
    try {
        const hoSo = await taoHoSo(req.body);
        // Nếu request có file avatar (multipart), upload luôn cho SV
        if (req.file) {
            const relativePath = `avatars/${req.file.filename}`;
            await capNhatAvatar(hoSo.maSinhVien, relativePath);
        }
        res.status(201).json(hoSo);
    }
    catch (err) {
        // Xóa file đã upload nếu tạo hồ sơ thất bại
        if (req.file) {
            try {
                fs.unlinkSync(req.file.path);
            }
            catch { }
        }
        sendError(res, err, "Không thể tạo hồ sơ tuyển sinh");
    }
};
export const layDanhSachHoSoHandler = async (req, res) => {
    try {
        res.json(await layDanhSachHoSo(req.query));
    }
    catch (err) {
        sendError(res, err, "Không thể lấy danh sách hồ sơ");
    }
};
export const layHoSoTheoIdHandler = async (req, res) => {
    try {
        const id = req.params.id;
        if (typeof id !== "string") {
            return res.status(400).json({ error: "ID không hợp lệ" });
        }
        const hoSo = await layHoSoTheoId(id);
        if (!hoSo) {
            return res.status(404).json({ error: "Không tìm thấy hồ sơ" });
        }
        res.json(hoSo);
    }
    catch (err) {
        sendError(res, err, "Không thể lấy hồ sơ");
    }
};
export const capNhatTrangThaiHandler = async (req, res) => {
    try {
        const id = req.params.id;
        if (typeof id !== "string") {
            return res.status(400).json({ error: "ID không hợp lệ" });
        }
        const { trangThai, ghiChu } = req.body;
        // Validate ghiChu: required, not empty/whitespace
        if (!ghiChu || typeof ghiChu !== "string" || ghiChu.trim().length === 0) {
            return res.status(400).json({ error: "Ghi chú là bắt buộc" });
        }
        const trimmedGhiChu = ghiChu.trim();
        // Validate ghiChu length: 5-500 chars after trim
        if (trimmedGhiChu.length < 5 || trimmedGhiChu.length > 500) {
            return res.status(400).json({ error: "Ghi chú phải từ 5 đến 500 ký tự" });
        }
        res.json(await capNhatTrangThai(id, trangThai, trimmedGhiChu, req.user.id));
    }
    catch (err) {
        sendError(res, err, "Không thể cập nhật trạng thái");
    }
};
export const layThongKeHandler = async (_req, res) => {
    try {
        res.json(await layThongKe());
    }
    catch (err) {
        sendError(res, err, "Không thể lấy thống kê");
    }
};
export const layLichSuCapNhatHandler = async (req, res) => {
    try {
        const id = req.params.id;
        if (typeof id !== "string") {
            return res.status(400).json({ error: "ID không hợp lệ" });
        }
        const lichSu = await layLichSu(id);
        res.json(lichSu);
    }
    catch (err) {
        sendError(res, err, "Không thể lấy lịch sử cập nhật");
    }
};
