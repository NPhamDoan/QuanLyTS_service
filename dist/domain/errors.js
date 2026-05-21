/**
 * Domain errors — ngôn ngữ trung lập, không phụ thuộc DB.
 * Repositories throw các errors này; services bắt và chuyển thành HTTP status.
 */
export class NotFoundError extends Error {
    constructor(entity) {
        super(`Không tìm thấy ${entity}`);
        this.kind = "NotFound";
    }
}
export class ConflictError extends Error {
    constructor(message) {
        super(message);
        this.kind = "Conflict";
    }
}
export class ForeignKeyError extends Error {
    constructor(message) {
        super(message);
        this.kind = "ForeignKey";
    }
}
export class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.kind = "Validation";
    }
}
export class ForbiddenError extends Error {
    constructor(message) {
        super(message);
        this.kind = "Forbidden";
    }
}
export class UnauthorizedError extends Error {
    constructor(message) {
        super(message);
        this.kind = "Unauthorized";
    }
}
/** Map domain error → HTTP status. Dùng ở controllers. */
export function toHttpStatus(err) {
    if (err instanceof NotFoundError)
        return { status: 404, message: err.message };
    if (err instanceof ConflictError)
        return { status: 409, message: err.message };
    if (err instanceof ForeignKeyError)
        return { status: 409, message: err.message };
    if (err instanceof ValidationError)
        return { status: 400, message: err.message };
    if (err instanceof ForbiddenError)
        return { status: 403, message: err.message };
    if (err instanceof UnauthorizedError)
        return { status: 401, message: err.message };
    // Legacy { status, message } shape — giữ tương thích ngược
    if (err && typeof err === "object" && "status" in err && "message" in err) {
        return {
            status: err.status || 500,
            message: err.message || "Lỗi máy chủ",
        };
    }
    return { status: 500, message: "Lỗi máy chủ" };
}
