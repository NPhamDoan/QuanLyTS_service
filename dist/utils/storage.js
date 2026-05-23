import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/**
 * Đường dẫn các thư mục upload trên disk.
 *
 * Resolve tương đối so với `src/utils` (dev) hoặc `dist/utils` (production)
 * — cùng kết quả vì `rootDir=src` và `outDir=dist` đối xứng:
 *   backend/src/utils/storage.ts  -> ../../uploads = backend/uploads
 *   backend/dist/utils/storage.js -> ../../uploads = backend/uploads
 *
 * Dùng chung giữa controllers (serve / download file) và services
 * (cleanup khi xóa entity).
 */
export const uploadsRoot = path.join(__dirname, "..", "..", "uploads");
export const publicDir = path.join(uploadsRoot, "public");
export const privateDir = path.join(uploadsRoot, "private");
