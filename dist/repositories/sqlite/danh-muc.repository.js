/**
 * Catalog repositories cho SQLite — 4 thực thể quản trị danh mục.
 *
 * Mỗi class là một thin wrapper: ủy quyền toàn bộ method cho
 * `makeSqliteCatalogRepo` với config riêng (tên bảng, cột, ORDER BY,
 * thông báo lỗi). Pattern findAll/findAllActive/findById/create/update/
 * delete được dùng chung — xem `catalog-repo.ts`.
 */
import { makeSqliteCatalogRepo } from "./catalog-repo.js";
// ============================================
// NamTuyenSinh
// ============================================
export class SqliteNamTuyenSinhRepository {
    constructor() {
        this.impl = makeSqliteCatalogRepo({
            className: "SqliteNamTuyenSinhRepository",
            notFoundEntity: "năm tuyển sinh",
            tableName: "NamTuyenSinh",
            selectColumns: "*",
            selectFrom: "NamTuyenSinh",
            idColumn: "id",
            trangThaiColumn: "trangThai",
            orderBy: "nam DESC",
            writableColumns: ["nam", "trangThai"],
            conflictMessage: "Năm tuyển sinh đã tồn tại",
            foreignKeyMessage: "Không thể xóa năm tuyển sinh đang được sử dụng",
        });
        this.findAll = () => this.impl.findAll();
        this.findAllActive = () => this.impl.findAllActive();
        this.findById = (id) => this.impl.findById(id);
        this.create = (data) => this.impl.create(data);
        this.update = (id, data) => this.impl.update(id, data);
        this.delete = (id) => this.impl.delete(id);
    }
}
// ============================================
// DotTuyenSinh — JOIN với NamTuyenSinh để lấy `namTuyenSinh` (tên năm)
// ============================================
export class SqliteDotTuyenSinhRepository {
    constructor() {
        this.impl = makeSqliteCatalogRepo({
            className: "SqliteDotTuyenSinhRepository",
            notFoundEntity: "đợt tuyển sinh",
            tableName: "DotTuyenSinh",
            // SELECT JOIN — alias bảng để khớp idColumn / trangThaiColumn ở dưới.
            selectColumns: "d.*, n.nam AS namTuyenSinh",
            selectFrom: "DotTuyenSinh d JOIN NamTuyenSinh n ON d.namTuyenSinhId = n.id",
            idColumn: "d.id",
            trangThaiColumn: "d.trangThai",
            orderBy: "n.nam DESC, d.tenDot ASC",
            writableColumns: ["tenDot", "namTuyenSinhId", "trangThai"],
            conflictMessage: "Đợt tuyển sinh đã tồn tại trong năm này",
            foreignKeyMessage: "Không thể xóa đợt tuyển sinh đang được sử dụng",
        });
        this.findAll = () => this.impl.findAll();
        this.findAllActive = () => this.impl.findAllActive();
        this.findById = (id) => this.impl.findById(id);
        this.create = (data) => this.impl.create(data);
        this.update = (id, data) => this.impl.update(id, data);
        this.delete = (id) => this.impl.delete(id);
    }
}
// ============================================
// NganhDangKy
// ============================================
export class SqliteNganhDangKyRepository {
    constructor() {
        this.impl = makeSqliteCatalogRepo({
            className: "SqliteNganhDangKyRepository",
            notFoundEntity: "ngành đăng ký",
            tableName: "NganhDangKy",
            selectColumns: "*",
            selectFrom: "NganhDangKy",
            idColumn: "id",
            trangThaiColumn: "trangThai",
            orderBy: "tenNganh ASC",
            writableColumns: ["tenNganh", "maNganh", "trangThai"],
            conflictMessage: "Mã ngành đã tồn tại",
            foreignKeyMessage: "Không thể xóa ngành đăng ký đang được sử dụng",
        });
        this.findAll = () => this.impl.findAll();
        this.findAllActive = () => this.impl.findAllActive();
        this.findById = (id) => this.impl.findById(id);
        this.create = (data) => this.impl.create(data);
        this.update = (id, data) => this.impl.update(id, data);
        this.delete = (id) => this.impl.delete(id);
    }
}
// ============================================
// HeDaoTao
// ============================================
export class SqliteHeDaoTaoRepository {
    constructor() {
        this.impl = makeSqliteCatalogRepo({
            className: "SqliteHeDaoTaoRepository",
            notFoundEntity: "hệ đào tạo",
            tableName: "HeDaoTao",
            selectColumns: "*",
            selectFrom: "HeDaoTao",
            idColumn: "id",
            trangThaiColumn: "trangThai",
            orderBy: "tenHe ASC",
            writableColumns: ["tenHe", "trangThai"],
            conflictMessage: "Hệ đào tạo đã tồn tại",
            foreignKeyMessage: "Không thể xóa hệ đào tạo đang được sử dụng",
        });
        this.findAll = () => this.impl.findAll();
        this.findAllActive = () => this.impl.findAllActive();
        this.findById = (id) => this.impl.findById(id);
        this.create = (data) => this.impl.create(data);
        this.update = (id, data) => this.impl.update(id, data);
        this.delete = (id) => this.impl.delete(id);
    }
}
