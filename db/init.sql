-- ============================================
-- XÓA BẢNG CŨ (thứ tự ngược FK)
-- ============================================
DROP TABLE IF EXISTS RefreshToken;
DROP TABLE IF EXISTS LichSuCapNhat;
DROP TABLE IF EXISTS TepDinhKem;
DROP TABLE IF EXISTS HoSoTuyenSinh;
DROP TABLE IF EXISTS SinhVien;
DROP TABLE IF EXISTS TaiKhoan;
DROP TABLE IF EXISTS DotTuyenSinh;
DROP TABLE IF EXISTS NamTuyenSinh;
DROP TABLE IF EXISTS NganhDangKy;
DROP TABLE IF EXISTS HeDaoTao;

-- ============================================
-- BẢNG NGƯỜI DÙNG
-- ============================================
CREATE TABLE TaiKhoan (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenDangNhap TEXT NOT NULL UNIQUE,
  matKhauHash TEXT NOT NULL,
  hoTen TEXT NOT NULL,
  vaiTro TEXT NOT NULL CHECK (vaiTro IN ('admin', 'staff')),
  trangThai TEXT NOT NULL DEFAULT 'hoat_dong' CHECK (trangThai IN ('hoat_dong', 'vo_hieu_hoa')),
  ngayTao TEXT NOT NULL,
  ngayCapNhat TEXT NOT NULL
);

-- ============================================
-- BẢNG REFRESH TOKEN
-- ============================================
CREATE TABLE RefreshToken (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  taiKhoanId INTEGER NOT NULL,
  tokenHash TEXT NOT NULL,
  hetHan TEXT NOT NULL,
  ngayTao TEXT NOT NULL,
  FOREIGN KEY (taiKhoanId) REFERENCES TaiKhoan(id) ON DELETE CASCADE
);

-- ============================================
-- BẢNG DANH MỤC
-- ============================================
CREATE TABLE NamTuyenSinh (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nam TEXT NOT NULL UNIQUE,
  trangThai TEXT NOT NULL DEFAULT 'hoat_dong' CHECK (trangThai IN ('hoat_dong', 'khong_hoat_dong')),
  ngayTao TEXT NOT NULL,
  ngayCapNhat TEXT NOT NULL
);

CREATE TABLE DotTuyenSinh (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenDot TEXT NOT NULL,
  namTuyenSinhId INTEGER NOT NULL,
  trangThai TEXT NOT NULL DEFAULT 'hoat_dong' CHECK (trangThai IN ('hoat_dong', 'khong_hoat_dong')),
  ngayTao TEXT NOT NULL,
  ngayCapNhat TEXT NOT NULL,
  FOREIGN KEY (namTuyenSinhId) REFERENCES NamTuyenSinh(id) ON DELETE RESTRICT,
  UNIQUE(tenDot, namTuyenSinhId)
);

CREATE TABLE NganhDangKy (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenNganh TEXT NOT NULL,
  maNganh TEXT NOT NULL UNIQUE,
  trangThai TEXT NOT NULL DEFAULT 'hoat_dong' CHECK (trangThai IN ('hoat_dong', 'khong_hoat_dong')),
  ngayTao TEXT NOT NULL,
  ngayCapNhat TEXT NOT NULL
);

CREATE TABLE HeDaoTao (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenHe TEXT NOT NULL UNIQUE,
  trangThai TEXT NOT NULL DEFAULT 'hoat_dong' CHECK (trangThai IN ('hoat_dong', 'khong_hoat_dong')),
  ngayTao TEXT NOT NULL,
  ngayCapNhat TEXT NOT NULL
);

-- ============================================
-- BẢNG SINH VIÊN (giữ nguyên)
-- ============================================
CREATE TABLE SinhVien (
  maSinhVien TEXT PRIMARY KEY,
  hoTen TEXT NOT NULL,
  ngaySinh TEXT NOT NULL,
  gioiTinh TEXT NOT NULL,
  cccd TEXT NOT NULL,
  email TEXT NOT NULL,
  soDienThoai TEXT NOT NULL,
  diaChi TEXT NOT NULL,
  anhDaiDien TEXT,
  ngayTao TEXT NOT NULL,
  ngayCapNhat TEXT NOT NULL
);

-- ============================================
-- BẢNG HỒ SƠ TUYỂN SINH (chuyển sang FK ID)
-- ============================================
CREATE TABLE HoSoTuyenSinh (
  maHoSo TEXT PRIMARY KEY,
  maSinhVien TEXT NOT NULL,
  namTuyenSinhId INTEGER NOT NULL,
  dotTuyenSinhId INTEGER NOT NULL,
  nganhDangKyId INTEGER NOT NULL,
  heDaoTaoId INTEGER NOT NULL,
  trangThai TEXT NOT NULL,
  ghiChu TEXT,
  ngayTao TEXT NOT NULL,
  ngayCapNhat TEXT NOT NULL,
  FOREIGN KEY (maSinhVien) REFERENCES SinhVien(maSinhVien),
  FOREIGN KEY (namTuyenSinhId) REFERENCES NamTuyenSinh(id) ON DELETE RESTRICT,
  FOREIGN KEY (dotTuyenSinhId) REFERENCES DotTuyenSinh(id) ON DELETE RESTRICT,
  FOREIGN KEY (nganhDangKyId) REFERENCES NganhDangKy(id) ON DELETE RESTRICT,
  FOREIGN KEY (heDaoTaoId) REFERENCES HeDaoTao(id) ON DELETE RESTRICT
);

-- ============================================
-- BẢNG TỆP ĐÍNH KÈM (giữ nguyên)
-- ============================================
CREATE TABLE TepDinhKem (
  maTep TEXT PRIMARY KEY,
  maHoSo TEXT NOT NULL,
  tenTep TEXT NOT NULL,
  duongDan TEXT NOT NULL,
  loaiTep TEXT NOT NULL,
  FOREIGN KEY (maHoSo) REFERENCES HoSoTuyenSinh(maHoSo)
);

-- ============================================
-- BẢNG LỊCH SỬ CẬP NHẬT TRẠNG THÁI
-- ============================================
CREATE TABLE LichSuCapNhat (
  id TEXT PRIMARY KEY,
  maHoSo TEXT NOT NULL,
  trangThaiCu TEXT NOT NULL,
  trangThaiMoi TEXT NOT NULL,
  ghiChu TEXT NOT NULL,
  nguoiThucHienId INTEGER NOT NULL,
  thoiGian TEXT NOT NULL,
  FOREIGN KEY (maHoSo) REFERENCES HoSoTuyenSinh(maHoSo) ON DELETE CASCADE,
  FOREIGN KEY (nguoiThucHienId) REFERENCES TaiKhoan(id) ON DELETE RESTRICT
);

-- ============================================
-- SEED DATA
-- ============================================

-- SEED: Tài khoản (admin + staff)
-- Password: 123456 (bcrypt hash)
INSERT INTO TaiKhoan (tenDangNhap, matKhauHash, hoTen, vaiTro, trangThai, ngayTao, ngayCapNhat) VALUES
('admin', '$2b$10$rC2CFN99/JipTaS.iQvq6.H9kSQReMk6NyxLP1yCgV.m0U8eVDopa', 'Quản trị viên', 'admin', 'hoat_dong', '2024-01-01T00:00:00.000Z', '2024-01-01T00:00:00.000Z'),
('staff1', '$2b$10$rC2CFN99/JipTaS.iQvq6.H9kSQReMk6NyxLP1yCgV.m0U8eVDopa', 'Nguyễn Thị Hoa', 'staff', 'hoat_dong', '2024-01-01T00:00:00.000Z', '2024-01-01T00:00:00.000Z');

-- SEED: Danh mục
INSERT INTO NamTuyenSinh (nam, trangThai, ngayTao, ngayCapNhat) VALUES
('2024', 'hoat_dong', '2024-01-01', '2024-01-01'),
('2025', 'hoat_dong', '2025-01-01', '2025-01-01'),
('2026', 'hoat_dong', '2026-01-01', '2026-01-01');

INSERT INTO DotTuyenSinh (tenDot, namTuyenSinhId, trangThai, ngayTao, ngayCapNhat) VALUES
('Đợt 1', 1, 'hoat_dong', '2024-01-01', '2024-01-01'),
('Đợt 2', 1, 'hoat_dong', '2024-01-01', '2024-01-01'),
('Đợt 1', 2, 'hoat_dong', '2025-01-01', '2025-01-01'),
('Đợt 1', 3, 'hoat_dong', '2026-01-01', '2026-01-01');

INSERT INTO NganhDangKy (tenNganh, maNganh, trangThai, ngayTao, ngayCapNhat) VALUES
('Công nghệ thông tin', 'CNTT', 'hoat_dong', '2024-01-01', '2024-01-01'),
('Quản trị kinh doanh', 'QTKD', 'hoat_dong', '2024-01-01', '2024-01-01'),
('Kỹ thuật phần mềm', 'KTPM', 'hoat_dong', '2024-01-01', '2024-01-01');

INSERT INTO HeDaoTao (tenHe, trangThai, ngayTao, ngayCapNhat) VALUES
('Đại học chính quy', 'hoat_dong', '2024-01-01', '2024-01-01'),
('Cao đẳng', 'hoat_dong', '2024-01-01', '2024-01-01'),
('Liên thông', 'hoat_dong', '2024-01-01', '2024-01-01');

-- SEED: Sinh viên mẫu
INSERT INTO SinhVien (maSinhVien, hoTen, ngaySinh, gioiTinh, cccd, email, soDienThoai, diaChi, ngayTao, ngayCapNhat) VALUES
('SV001', 'Nguyễn Văn A', '2000-05-20', 'Nam', '012345678901', 'vana@example.com', '0901234567', 'TP. HCM', '2024-01-01', '2024-01-01'),
('SV002', 'Trần Thị B', '2001-11-02', 'Nữ', '023456789012', 'thib@example.com', '0912345678', 'Hà Nội', '2024-01-02', '2024-01-02'),
('SV003', 'Lê Minh C', '1999-03-15', 'Nam', '034567890123', 'minhc@example.com', '0923456789', 'Đà Nẵng', '2024-01-03', '2024-01-03');

-- SEED: Hồ sơ mẫu (dùng ID thay vì text)
INSERT INTO HoSoTuyenSinh (maHoSo, maSinhVien, namTuyenSinhId, dotTuyenSinhId, nganhDangKyId, heDaoTaoId, trangThai, ghiChu, ngayTao, ngayCapNhat) VALUES
('HS001', 'SV001', 1, 1, 1, 1, 'moi_nop', NULL, '2024-01-10', '2024-01-10'),
('HS002', 'SV002', 1, 1, 2, 1, 'dang_kiem_tra', 'Thiếu giấy khai sinh', '2024-01-11', '2024-01-11'),
('HS003', 'SV003', 1, 2, 3, 1, 'hoan_tat', NULL, '2024-02-01', '2024-02-01'),
('HS004', 'SV001', 2, 3, 1, 1, 'moi_nop', NULL, '2025-01-15', '2025-01-15'),
('HS005', 'SV002', 2, 3, 2, 2, 'dang_kiem_tra', NULL, '2025-01-20', '2025-01-20'),
('HS006', 'SV003', 3, 4, 3, 3, 'moi_nop', NULL, '2026-01-10', '2026-01-10');

-- SEED: Tệp đính kèm mẫu
INSERT INTO TepDinhKem (maTep, maHoSo, tenTep, duongDan, loaiTep) VALUES
('TP001', 'HS001', 'cccd.pdf', '/uploads/HS001/cccd.pdf', 'PDF'),
('TP002', 'HS001', 'hocba.jpg', '/uploads/HS001/hocba.jpg', 'Hình ảnh'),
('TP003', 'HS002', 'giaykhaisinh.png', '/uploads/HS002/giaykhaisinh.png', 'Hình ảnh'),
('TP004', 'HS003', 'bangtotnghiep.pdf', '/uploads/HS003/bangtotnghiep.pdf', 'PDF');

-- SEED: Lịch sử cập nhật trạng thái
-- HS002: moi_nop → dang_kiem_tra (by admin)
INSERT INTO LichSuCapNhat (id, maHoSo, trangThaiCu, trangThaiMoi, ghiChu, nguoiThucHienId, thoiGian) VALUES
('ls-001', 'HS002', 'moi_nop', 'dang_kiem_tra', 'Đã tiếp nhận hồ sơ, chuyển sang kiểm tra', 1, '2024-01-12T09:30:00.000Z');

-- HS003: moi_nop → dang_kiem_tra → hoan_tat (by staff1 and admin)
INSERT INTO LichSuCapNhat (id, maHoSo, trangThaiCu, trangThaiMoi, ghiChu, nguoiThucHienId, thoiGian) VALUES
('ls-002', 'HS003', 'moi_nop', 'dang_kiem_tra', 'Bắt đầu kiểm tra hồ sơ đợt 2', 2, '2024-02-02T08:00:00.000Z'),
('ls-003', 'HS003', 'dang_kiem_tra', 'hoan_tat', 'Hồ sơ đầy đủ, đạt yêu cầu nhập học', 1, '2024-02-05T14:15:00.000Z');

-- HS005: moi_nop → dang_kiem_tra (by staff1)
INSERT INTO LichSuCapNhat (id, maHoSo, trangThaiCu, trangThaiMoi, ghiChu, nguoiThucHienId, thoiGian) VALUES
('ls-004', 'HS005', 'moi_nop', 'dang_kiem_tra', 'Kiểm tra giấy tờ tuyển sinh năm 2025', 2, '2025-01-21T10:45:00.000Z');
