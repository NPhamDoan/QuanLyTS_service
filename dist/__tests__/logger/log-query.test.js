/**
 * Feature: common-logging
 * Property 9: Debug query logs contain repo, op, and masked params
 *   Validates: Requirements 5.1
 *
 * Property 10: Query debug logs are suppressed above debug level
 *   Validates: Requirements 5.2
 *
 * Property 11: Query failures log full error details
 *   Validates: Requirements 5.3
 */
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { makeIsolatedLogger } from "../helpers/capture.js";
import { logQuery, logQueryError } from "../../logger.js";
import { arbValidLevel, arbMaskedField, arbSecretValue, } from "../helpers/arbitraries.js";
describe("logQuery / logQueryError", () => {
    it("Property 9: at debug or trace, logQuery emits repo, op, params with secrets masked", () => {
        fc.assert(fc.property(fc.constantFrom("debug", "trace"), fc
            .string({ minLength: 1, maxLength: 16 })
            .filter((s) => /^[A-Za-z0-9_]+$/.test(s)), fc
            .string({ minLength: 1, maxLength: 16 })
            .filter((s) => /^[A-Za-z0-9_]+$/.test(s)), 
        // `authorization` không nằm trong path params.*/params.data.* của
        // REDACT_PATHS (Requirement 6.2 chỉ áp dụng cho top-level/req.*/res.*),
        // và repo không log authorization như tham số query → loại khỏi test.
        arbMaskedField.filter((f) => f !== "authorization"), arbSecretValue, (level, repo, op, field, secret) => {
            const { logger, capture } = makeIsolatedLogger({
                level,
                pretty: false,
            });
            // Mỗi MaskedField có thể nằm ở cấp params.<field> (config gốc) hoặc
            // params.data.<field> (config mở rộng). Test cả hai đường dẫn.
            logQuery(repo, op, { [field]: secret, data: { [field]: secret + "-d" } }, logger);
            const records = capture.records();
            if (records.length !== 1)
                return false;
            const r = records[0];
            if (r.repo !== repo)
                return false;
            if (r.op !== op)
                return false;
            if (typeof r.params !== "object" || r.params === null)
                return false;
            const raw = JSON.stringify(r);
            if (raw.includes(secret))
                return false; // value gốc bị che
            return raw.includes("[REDACTED]");
        }), { numRuns: 80 });
    });
    it("Property 10: at info/warn/error/fatal/silent, logQuery emits nothing", () => {
        fc.assert(fc.property(arbValidLevel.filter((l) => l !== "debug" && l !== "trace"), (level) => {
            const { logger, capture } = makeIsolatedLogger({
                level,
                pretty: false,
            });
            logQuery("Repo", "op", { x: 1 }, logger);
            return capture.flushLines().length === 0;
        }), { numRuns: 50 });
    });
    it("Property 11: logQueryError emits error level with name/message/stack", () => {
        fc.assert(fc.property(fc
            .string({ minLength: 1, maxLength: 16 })
            .filter((s) => /^[A-Za-z0-9_]+$/.test(s)), fc
            .string({ minLength: 1, maxLength: 16 })
            .filter((s) => /^[A-Za-z0-9_]+$/.test(s)), fc.string({ minLength: 1, maxLength: 32 }), (repo, op, msg) => {
            const { logger, capture } = makeIsolatedLogger({
                level: "error",
                pretty: false,
            });
            const err = new Error(msg);
            logQueryError(repo, op, err, logger);
            const records = capture.records();
            if (records.length !== 1)
                return false;
            const r = records[0];
            // pino numeric error level = 50
            if (r.level !== 50)
                return false;
            if (r.repo !== repo)
                return false;
            if (r.op !== op)
                return false;
            if (!r.err)
                return false;
            if (r.err.name !== "Error")
                return false;
            if (r.err.message !== msg)
                return false;
            if (typeof r.err.stack !== "string")
                return false;
            if (r.err.stack.length === 0)
                return false;
            return true;
        }), { numRuns: 80 });
    });
    it("Property 11 (non-Error input): logQueryError still produces a structured err record", () => {
        const { logger, capture } = makeIsolatedLogger({
            level: "error",
            pretty: false,
        });
        logQueryError("R", "op", "string thrown", logger);
        const r = capture.records()[0];
        expect(r.err.name).toBe("Error");
        expect(r.err.message).toBe("string thrown");
        expect(typeof r.err.stack).toBe("string");
    });
});
