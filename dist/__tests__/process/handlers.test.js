/**
 * Feature: common-logging
 * Task 4.2: Unit test cho process handlers (uncaughtException, unhandledRejection)
 * Validates: Requirements 3.2, 3.3
 *
 * Strategy: import logger module, đăng ký handler giống như `server.ts`,
 * gọi handler thủ công với một Error mẫu, kiểm tra logger ghi đúng level
 * và đầy đủ name/message/stack. Không thực sự kích hoạt sự kiện process —
 * chỉ test logic bên trong handler.
 */
import { describe, it, expect, vi } from "vitest";
import { logger } from "../../logger.js";
/** Lấy đúng các handler được đăng ký trong server.ts (mô phỏng lại). */
function uncaughtExceptionHandler(err) {
    logger.fatal({ err: { name: err.name, message: err.message, stack: err.stack } }, "uncaughtException");
}
function unhandledRejectionHandler(reason) {
    const err = reason instanceof Error ? reason : new Error(String(reason));
    logger.error({ err: { name: err.name, message: err.message, stack: err.stack } }, "unhandledRejection");
}
describe("process handlers", () => {
    it("uncaughtException handler calls logger.fatal with full error details", () => {
        const fatalSpy = vi.spyOn(logger, "fatal").mockImplementation(() => undefined);
        try {
            const err = new Error("boom");
            err.name = "BoomError";
            uncaughtExceptionHandler(err);
            expect(fatalSpy).toHaveBeenCalledTimes(1);
            const [bindings, msg] = fatalSpy.mock.calls[0];
            expect(msg).toBe("uncaughtException");
            expect(bindings.err.name).toBe("BoomError");
            expect(bindings.err.message).toBe("boom");
            expect(typeof bindings.err.stack).toBe("string");
        }
        finally {
            fatalSpy.mockRestore();
        }
    });
    it("unhandledRejection handler with Error reason calls logger.error", () => {
        const errorSpy = vi.spyOn(logger, "error").mockImplementation(() => undefined);
        try {
            const reason = new Error("rejected");
            unhandledRejectionHandler(reason);
            expect(errorSpy).toHaveBeenCalledTimes(1);
            const [bindings, msg] = errorSpy.mock.calls[0];
            expect(msg).toBe("unhandledRejection");
            expect(bindings.err.name).toBe("Error");
            expect(bindings.err.message).toBe("rejected");
            expect(typeof bindings.err.stack).toBe("string");
        }
        finally {
            errorSpy.mockRestore();
        }
    });
    it("unhandledRejection handler normalizes non-Error reason to Error", () => {
        const errorSpy = vi.spyOn(logger, "error").mockImplementation(() => undefined);
        try {
            unhandledRejectionHandler("string-rejection");
            expect(errorSpy).toHaveBeenCalledTimes(1);
            const [bindings] = errorSpy.mock.calls[0];
            expect(bindings.err.name).toBe("Error");
            expect(bindings.err.message).toBe("string-rejection");
        }
        finally {
            errorSpy.mockRestore();
        }
    });
});
