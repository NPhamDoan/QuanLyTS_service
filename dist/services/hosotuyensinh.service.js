import { repos } from "../repositories/index.js";
import { NotFoundError, ValidationError } from "../domain/errors.js";
export const taoHoSo = (data) => repos.hoSo.create(data);
export const layDanhSachHoSo = (filters) => repos.hoSo.findAll(filters);
export const layHoSoTheoId = (maHoSo) => repos.hoSo.findById(maHoSo);
export const capNhatTrangThai = async (maHoSo, trangThai, ghiChu, nguoiThucHienId) => {
    // 1. Lấy trạng thái hiện tại
    const hoSo = await repos.hoSo.findRawById(maHoSo);
    if (!hoSo)
        throw new NotFoundError("hồ sơ");
    // 2. Reject nếu trạng thái không thay đổi
    if (hoSo.trangThai === trangThai) {
        throw new ValidationError("Trạng thái mới phải khác trạng thái hiện tại");
    }
    // 3. Atomic: cập nhật trạng thái + ghi lịch sử (trong 1 transaction)
    await repos.lichSu.capNhatTrangThaiVaGhiLichSu({
        maHoSo,
        trangThaiCu: hoSo.trangThai,
        trangThaiMoi: trangThai,
        ghiChu,
        nguoiThucHienId,
    });
    return (await repos.hoSo.findById(maHoSo));
};
export const layThongKe = () => repos.hoSo.thongKe();
export const layLichSu = async (maHoSo) => {
    // Check hồ sơ tồn tại
    const hoSo = await repos.hoSo.findRawById(maHoSo);
    if (!hoSo)
        throw new NotFoundError("hồ sơ");
    // Trả về danh sách lịch sử
    return repos.lichSu.findByMaHoSo(maHoSo);
};
