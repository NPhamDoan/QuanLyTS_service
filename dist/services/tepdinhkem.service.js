import { repos } from "../repositories/index.js";
export const themTepDinhKem = (data) => repos.tepDinhKem.create(data);
export const layDanhSachTepTheoHoSo = (maHoSo) => repos.tepDinhKem.findByHoSo(maHoSo);
export const layTepTheoId = (maTep) => repos.tepDinhKem.findById(maTep);
export const xoaTepDinhKem = async (maTep) => {
    await repos.tepDinhKem.delete(maTep);
    return { success: true, maTep };
};
