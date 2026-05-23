/**
 * Feature: common-logging
 * Property 3: JSON output when LOG_PRETTY is not enabled
 * Validates: Requirements 1.5
 */
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { makeIsolatedLogger } from "../helpers/capture.js";
import { arbValidLevel } from "../helpers/arbitraries.js";
describe("logger JSON output", () => {
    it("Property 3: every line is valid JSON when pretty=false", () => {
        fc.assert(fc.property(
        // silent → không ghi gì → bỏ qua bằng filter dưới
        arbValidLevel.filter((l) => l !== "silent"), fc.string({ minLength: 1, maxLength: 32 }), (level, msg) => {
            const { logger, capture } = makeIsolatedLogger({
                level,
                pretty: false,
            });
            // Ghi đúng 1 record ở mức tương ứng để chắc chắn không bị filter
            // bởi level threshold.
            logger[level]({ x: 1 }, msg);
            const records = capture.records();
            // Đúng 1 line, parse được JSON
            expect(records.length).toBe(1);
            expect(typeof records[0]).toBe("object");
            // Pino chuẩn: có level, time, msg
            expect(records[0]).toHaveProperty("level");
            expect(records[0]).toHaveProperty("time");
            expect(records[0]).toHaveProperty("msg");
            return true;
        }), { numRuns: 60 });
    });
});
