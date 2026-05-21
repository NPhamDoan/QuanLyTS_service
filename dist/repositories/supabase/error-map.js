import { ConflictError, ForeignKeyError, NotFoundError, } from "../../domain/errors.js";
/**
 * Map Postgres error code → domain error.
 *
 * Mã lỗi Postgres hay gặp:
 *   23505 — unique_violation
 *   23503 — foreign_key_violation
 *   23502 — not_null_violation
 *   23514 — check_violation
 *   PGRST116 — PostgREST: không trả về row (dùng .single())
 */
export function mapPostgrestError(err, messages) {
    if (err.code === "23505") {
        return new ConflictError(messages.conflict || "Dữ liệu đã tồn tại");
    }
    if (err.code === "23503") {
        return new ForeignKeyError(messages.foreignKey || "Không thể thực hiện do ràng buộc khóa ngoại");
    }
    if (err.code === "PGRST116") {
        return new NotFoundError(messages.notFound || "bản ghi");
    }
    return new Error(err.message || "Lỗi cơ sở dữ liệu");
}
/**
 * Ném error nếu `error` không null. Dùng cho Supabase queries.
 */
export function throwIfError(error, messages = {}) {
    if (error)
        throw mapPostgrestError(error, messages);
}
