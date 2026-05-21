import { ConflictError, ForeignKeyError } from "../../domain/errors.js";
/**
 * Map lỗi từ better-sqlite3 → DomainError.
 *
 * better-sqlite3 throw Error với message format:
 *   "UNIQUE constraint failed: Table.column"
 *   "FOREIGN KEY constraint failed"
 */
export function mapSqliteError(err, messages) {
    const msg = err?.message;
    if (typeof msg !== "string")
        return err;
    if (msg.includes("UNIQUE constraint failed")) {
        return new ConflictError(messages.conflict || "Dữ liệu đã tồn tại");
    }
    if (msg.includes("FOREIGN KEY constraint failed")) {
        return new ForeignKeyError(messages.foreignKey || "Không thể thực hiện do ràng buộc khóa ngoại");
    }
    return err;
}
/**
 * Chạy một SQLite operation và re-throw lỗi đã được map sang DomainError.
 */
export function runWithErrorMap(operation, messages) {
    try {
        return operation();
    }
    catch (err) {
        throw mapSqliteError(err, messages);
    }
}
