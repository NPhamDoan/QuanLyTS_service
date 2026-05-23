/**
 * Feature: common-logging
 * Property 12: MaskedField values are redacted at every configured path
 * Validates: Requirements 6.1, 6.2, 6.3
 */
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { makeIsolatedLogger } from "../helpers/capture.js";
import { arbMaskedSample } from "../helpers/arbitraries.js";
describe("logger masking", () => {
    it("Property 12: secrets are replaced by [REDACTED] at every configured path", () => {
        fc.assert(fc.property(arbMaskedSample, ({ payload, secrets }) => {
            const { logger, capture } = makeIsolatedLogger({
                level: "info",
                pretty: false,
            });
            logger.info(payload, "masking_smoke");
            const lines = capture.flushLines();
            expect(lines.length).toBe(1);
            const raw = lines[0];
            // Không value gốc nào lọt vào output
            for (const s of secrets) {
                if (raw.includes(s.value)) {
                    return false;
                }
            }
            // Mọi path nhạy cảm đã có [REDACTED] xuất hiện
            return raw.includes("[REDACTED]");
        }), { numRuns: 100 });
    });
});
