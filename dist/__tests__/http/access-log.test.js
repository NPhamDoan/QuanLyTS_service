/**
 * Feature: common-logging
 * Property 4: HTTP access log contains required fields
 * Validates: Requirements 2.1, 2.2
 */
import { describe, it, expect } from "vitest";
import request from "supertest";
import { makeHarnessApp } from "../helpers/app-harness.js";
async function flushNextTick() {
    await new Promise((r) => setImmediate(r));
}
describe("HTTP access log", () => {
    it("Property 4: access log contains method, url, statusCode, responseTime, req.id", async () => {
        const { app, capture } = makeHarnessApp("info", (a) => {
            a.get("/hello", (_req, res) => res.json({ ok: true }));
        });
        await request(app).get("/hello").expect(200);
        await flushNextTick();
        const records = capture.records();
        // pino-http luôn ghi đúng 1 record cho mỗi request kết thúc thành công.
        expect(records.length).toBe(1);
        const r = records[0];
        expect(r.req.method).toBe("GET");
        expect(r.req.url).toBe("/hello");
        expect(r.res.statusCode).toBe(200);
        expect(typeof r.responseTime).toBe("number");
        expect(["string", "number"]).toContain(typeof r.req.id);
    });
    it("Property 4: status >= 400 produces warn level access log", async () => {
        const { app, capture } = makeHarnessApp("info", (a) => {
            a.get("/missing", (_req, res) => res.status(404).json({ x: 1 }));
        });
        await request(app).get("/missing").expect(404);
        await flushNextTick();
        const r = capture.records()[0];
        expect(r.level).toBe(40); // warn
        expect(r.res.statusCode).toBe(404);
    });
});
