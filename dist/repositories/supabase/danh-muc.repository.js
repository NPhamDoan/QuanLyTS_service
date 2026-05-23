/**
 * Catalog repositories cho Supabase — 4 thực thể quản trị danh mục.
 * Pattern y hệt SQLite: thin wrapper delegate sang `makeSupabaseCatalogRepo`.
 */
import { makeSupabaseCatalogRepo } from "./catalog-repo.js";
// ============================================
// NamTuyenSinh
// ============================================
export class SupabaseNamTuyenSinhRepository {
    constructor() {
        this.impl = makeSupabaseCatalogRepo({
            className: "SupabaseNamTuyenSinhRepository",
            notFoundEntity: "năm tuyển sinh",
            tableName: "NamTuyenSinh",
            selectClause: "*",
            orders: [{ column: "nam", ascending: false }],
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
// DotTuyenSinh — embed NamTuyenSinh.nam, flatten thành `namTuyenSinh`
// ============================================
const DOT_SELECT_WITH_NAM = "*, NamTuyenSinh:namTuyenSinhId (nam)";
function flattenDot(row) {
    return {
        id: row.id,
        tenDot: row.tenDot,
        namTuyenSinhId: row.namTuyenSinhId,
        namTuyenSinh: row.NamTuyenSinh?.nam,
        trangThai: row.trangThai,
        ngayTao: row.ngayTao,
        ngayCapNhat: row.ngayCapNhat,
    };
}
export class SupabaseDotTuyenSinhRepository {
    constructor() {
        this.impl = makeSupabaseCatalogRepo({
            className: "SupabaseDotTuyenSinhRepository",
            notFoundEntity: "đợt tuyển sinh",
            tableName: "DotTuyenSinh",
            selectClause: DOT_SELECT_WITH_NAM,
            orders: [{ column: "tenDot" }],
            writableColumns: ["tenDot", "namTuyenSinhId", "trangThai"],
            flatten: flattenDot,
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
export class SupabaseNganhDangKyRepository {
    constructor() {
        this.impl = makeSupabaseCatalogRepo({
            className: "SupabaseNganhDangKyRepository",
            notFoundEntity: "ngành đăng ký",
            tableName: "NganhDangKy",
            selectClause: "*",
            orders: [{ column: "tenNganh" }],
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
export class SupabaseHeDaoTaoRepository {
    constructor() {
        this.impl = makeSupabaseCatalogRepo({
            className: "SupabaseHeDaoTaoRepository",
            notFoundEntity: "hệ đào tạo",
            tableName: "HeDaoTao",
            selectClause: "*",
            orders: [{ column: "tenHe" }],
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
