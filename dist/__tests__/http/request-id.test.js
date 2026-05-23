/**
 * Feature: common-logging
 * Property 5: RequestId is unique per request and propagated to child logs
 * Validates: Requirements 2.3
 */
import { describe, it, expect } from "vitest";
import request from "supertest";
import { makeHarnessApp } from "../helpers/app-harness.js";
async function flushNextTick() {
    await new Promise((r) => setImmediate(r));
}
describe("HTTP request id", () => {
    it("Property 5: every access log has a unique req.id and child logs share it", async () => {
        const { app, capture } = makeHarnessApp("info", (a) => {
            a.get("/echo", (req, res) => {
                // Ghi 1 log từ child logger (req.log) trong vòng đời request.
                req.log.info({ phase: "handler" }, "in_handler");
                res.json({ ok: true });
            });
        });
        const N = 8;
        await Promise.all(Array.from({ length: N }, () => request(app).get("/echo").expect(200)));
        await flushNextTick();
        const records = capture.records();
        // 2 record / request: 1 child-log "in_handler" + 1 access log
        expect(records.length).toBe(N * 2);
        // Group records theo req.id
        const groups = new Map();
        for (const r of records) {
            const id = String(r.req?.id ?? r.reqId ?? "MISSING");
            if (!groups.has(id))
                groups.set(id, []);
            groups.get(id).push(r);
        }
        expect(groups.has("MISSING")).toBe(false);
        expect(groups.size).toBe(N);
        for (const [, recs] of groups) {
            expect(recs.length).toBe(2);
            const handlerRec = recs.find((r) => r.msg === "in_handler");
            const accessRec = recs.find((r) => r.msg !== "in_handler");
            expect(handlerRec).toBeDefined();
            expect(accessRec).toBeDefined();
            // Cả hai phải có cùng req.id
            expect(String(handlerRec.req.id)).toBe(String(accessRec.req.id));
        }
    });
});
