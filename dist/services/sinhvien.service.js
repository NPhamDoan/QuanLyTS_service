import { repos } from "../repositories/index.js";
export const taoSinhVien = (data) => repos.sinhVien.create(data);
export const laySinhVien = (maSinhVien) => repos.sinhVien.findById(maSinhVien);
export const capNhatAvatar = (maSinhVien, anhDaiDien) => repos.sinhVien.updateAvatar(maSinhVien, anhDaiDien);
