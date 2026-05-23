import path from "path";
import fs from "fs";
import { taoSinhVien, laySinhVien, capNhatAvatar } from "../services/sinhvien.service.js";
import { toHttpStatus } from "../domain/errors.js";
import { publicDir } from "../utils/storage.js";
function sendError(res, err, fallback) {
    const { status, message } = toHttpStatus(err);
    res.status(status).json({ error: message || fallback });
}
export const taoSinhVienHandler = async (req, res) => {
    try {
        res.status(201).json(await taoSinhVien(req.body));
    }
    catch (err) {
        sendError(res, err, "Không thể tạo sinh viên");
    }
};
export const laySinhVienHandler = async (req, res) => {
    try {
        const id = req.params.id;
        if (typeof id !== "string") {
            return res.status(400).json({ error: "ID không hợp lệ" });
        }
        const sv = await laySinhVien(id);
        if (!sv) {
            return res.status(404).json({ error: "Không tìm thấy sinh viên" });
        }
        res.json(sv);
    }
    catch (err) {
        sendError(res, err, "Không thể lấy sinh viên");
    }
};
export const uploadAvatarHandler = async (req, res) => {
    try {
        const maSinhVien = req.params.maSinhVien;
        // Kiểm tra sinh viên tồn tại
        const sv = await laySinhVien(maSinhVien);
        if (!sv) {
            // Xóa file vừa upload nếu SV không tồn tại
            if (req.file)
                fs.unlinkSync(req.file.path);
            return res.status(404).json({ error: "Không tìm thấy sinh viên" });
        }
        if (!req.file) {
            return res.status(400).json({ error: "Không có file ảnh được upload" });
        }
        // Xóa avatar cũ nếu có
        if (sv.anhDaiDien) {
            const oldPath = path.join(publicDir, sv.anhDaiDien);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }
        // Lưu đường dẫn relative
        const relativePath = `avatars/${req.file.filename}`;
        await capNhatAvatar(maSinhVien, relativePath);
        res.json({ anhDaiDien: relativePath });
    }
    catch (err) {
        sendError(res, err, "Không thể upload avatar");
    }
};
