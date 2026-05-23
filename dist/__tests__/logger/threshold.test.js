/**
 * Feature: common-logging
 * Property 13: Records below LOG_LEVEL produce no output
 * Validates: Requirements 7.3, 7.4
 */
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { makeIsolatedLogger } from "../helpers/capture.js";
import { arbValidLevel, LEVEL_WEIGHTS } from "../helpers/arbitraries.js";
describe("logger level threshold", () => {
    it("Property 13: silent suppresses all calls", () => {
        fc.assert(fc.property(arbValidLevel.filter((l) => l !== "silent"), (callLevel) => {
            const { logger, capture } = makeIsolatedLogger({
                level: "silent",
                pretty: false,
            });
            logger[callLevel]({ x: 1 }, "msg");
            return capture.flushLines().length === 0;
        }), { numRuns: 60 });
    });
    it("Property 13: records below LOG_LEVEL produce no output", () => {
        // (configuredLevel, callLevel)
        const arbConfigured = arbValidLevel.filter((l) => l !== "silent");
        const arbCall = arbValidLevel.filter((l) => l !== "silent");
        fc.assert(fc.property(arbConfigured, arbCall, (configured, call) => {
            const { logger, capture } = makeIsolatedLogger({
                level: configured,
                pretty: false,
            });
            logger[call]({ x: 1 }, "msg");
            const expected = LEVEL_WEIGHTS[call] >= LEVEL_WEIGHTS[configured] ? 1 : 0;
            return capture.flushLines().length === expected;
        }), { numRuns: 100 });
    });
    it("sanity: silent is a valid level for createLogger", () => {
        const { logger, capture } = makeIsolatedLogger({
            level: "silent",
            pretty: false,
        });
        expect(logger.level).toBe("silent");
        logger.info("ignored");
        logger.fatal("ignored");
        expect(capture.flushLines().length).toBe(0);
    });
});
