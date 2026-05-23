/**
 * Feature: common-logging
 * Property 1: Logger respects LOG_LEVEL
 * Validates: Requirements 1.2, 7.1
 *
 * Property 2: Default level is info for invalid or missing LOG_LEVEL
 * Validates: Requirements 1.3
 */
import { describe, it } from "vitest";
import fc from "fast-check";
import { createLogger } from "../../logger.js";
import { arbValidLevel, arbInvalidLevel } from "../helpers/arbitraries.js";
describe("logger level resolution", () => {
    it("Property 1: respects every valid LOG_LEVEL", () => {
        fc.assert(fc.property(arbValidLevel, (level) => {
            const logger = createLogger({ level, pretty: false });
            return logger.level === level;
        }), { numRuns: 100 });
    });
    it("Property 2: defaults to info when LOG_LEVEL is invalid or missing", () => {
        // Bao gồm cả undefined (LOG_LEVEL không đặt).
        fc.assert(fc.property(fc.option(arbInvalidLevel, { nil: undefined }), (raw) => {
            const logger = createLogger({ level: raw, pretty: false });
            return logger.level === "info";
        }), { numRuns: 100 });
    });
});
