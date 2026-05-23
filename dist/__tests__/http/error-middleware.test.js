/**
 * Feature: common-logging
 * Property 7: Error middleware logs full error details with requestId
 * Validates: Requirements 3.1
 */
import { describe, it, expect } from "vitest";
import request from "supertest";
import { makeHarnessApp } from "../helpers/app-harness.js";
async function flushNextTick() {
    await new Promise((r) => setImmediate(r));
}
describe("Error middleware", () => {
    it("Property 7: log record has level=error and contains err.name/message/stack and req.id", async () => {
        const { app, capture } = makeHarnessApp("info", (a) => {
            a.get("/boom", () => {
                const err = new Error("boom!");
                err.name = "BoomError";
                throw err;
            });
        });
        const res = await request(app).get("/boom");
        expect(res.status).toBe(500);
        expect(res.body).toEqual({ error: "boom!" });
        await flushNextTick();
        const records = capture.records();
        // 1 record cho error middleware + 1 access log từ pino-http (level error
        // do statusCode >= 500).
        const errRec = records.find((r) => r.msg === "request.error");
        expect(errRec).toBeDefined();
        expect(errRec.level).toBe(50); // error
        expect(errRec.err).toBeDefined();
        expect(errRec.err.name).toBe("BoomError");
        expect(errRec.err.message).toBe("boom!");
        expect(typeof errRec.err.stack).toBe("string");
        expect(errRec.err.stack.length).toBeGreaterThan(0);
        expect(errRec.req?.id).toBeDefined();
    });
    it("Property 7: respects err.status when it is a number", async () => {
        const { app } = makeHarnessApp("info", (a) => {
            a.get("/forbidden", () => {
                const err = new Error("nope");
                err.status = 403;
                throw err;
            });
        });
        const res = await request(app).get("/forbidden");
        expect(res.status).toBe(403);
        expect(res.body).toEqual({ error: "nope" });
    });
});
