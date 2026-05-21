import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";
import fs from "fs";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// --- Avatar upload (public) ---
const avatarDir = path.join(__dirname, "..", "..", "uploads", "public", "avatars");
if (!fs.existsSync(avatarDir)) {
    fs.mkdirSync(avatarDir, { recursive: true });
}
const avatarStorage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, avatarDir),
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${randomUUID()}${ext}`);
    },
});
const ALLOWED_IMAGE_MIMES = ["image/jpeg", "image/png", "image/webp"];
const imageFilter = (_req, file, cb) => {
    if (ALLOWED_IMAGE_MIMES.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error("Chỉ chấp nhận file ảnh (jpg, png, webp)"));
    }
};
export const avatarUpload = multer({
    storage: avatarStorage,
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});
// --- File upload (private) ---
const fileDir = path.join(__dirname, "..", "..", "uploads", "private");
if (!fs.existsSync(fileDir)) {
    fs.mkdirSync(fileDir, { recursive: true });
}
const fileStorage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, fileDir),
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${randomUUID()}${ext}`);
    },
});
export const fileUpload = multer({
    storage: fileStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});
