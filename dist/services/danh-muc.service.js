/**
 * Re-export các repository instances dưới tên giữ tương thích với code cũ.
 * Các hàm `layDanhSach / layDanhSachHoatDong / them / capNhat / xoa` giờ được
 * cung cấp trực tiếp qua repository interface (async), mapping như sau:
 *
 *   Cũ                         →  Mới
 *   layDanhSach()              →  findAll()
 *   layDanhSachHoatDong()      →  findAllActive()
 *   them(data)                 →  create(data)
 *   capNhat(id, data)          →  update(id, data)
 *   xoa(id)                    →  delete(id)
 */
import { repos } from "../repositories/index.js";
export const namTuyenSinh = repos.namTuyenSinh;
export const dotTuyenSinh = repos.dotTuyenSinh;
export const nganhDangKy = repos.nganhDangKy;
export const heDaoTao = repos.heDaoTao;
