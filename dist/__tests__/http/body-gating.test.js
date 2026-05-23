/**
 * Feature: common-logging
 * Property 6: Body logging is gated by trace level
 * Validates: Requirements 2.4, 2.5
 *
 * Lưu ý: pino-http cache `req` vào chindings ngay khi request đến (trước khi
 * Express body-parser chạy), nên không thể đặt body vào key `req.body` —
 * sẽ bị chindings ghi đè rỗng. Logger expose body qua hai key đỉnh `reqBody`
 * và `resBody` ở mức trace, đáp ứng yêu cầu 2.4/2.5 mà không xung đột pino
 * chindings.
 */
import { describe, it, expect } from "vitest";
import request from "supertest";
import { makeHarnessApp } from "../helpers/app-harness.js";
const NON_TRACE_WITH_OUTPUT = ["debug", "info"];
async function flushNextTick() {
    await new Promise((r) => setImmediate(r));
}
describe("HTTP body gating", () => {
    it("Property 6: at trace level, access log includes reqBody and resBody", async () => {
        const { app, capture } = makeHarnessApp("trace", (a) => {
            a.post("/echo", (req, res) => {
                res.body = { received: req.body.name };
                res.json({ received: req.body.name });
            });
        });
        await request(app)
            .post("/echo")
            .send({ name: "kiro", greeting: "hi" })
            .expect(200);
        await flushNextTick();
        const accessRec = capture.records().find((r) => r.req && r.res);
        expect(accessRec).toBeDefined();
        expect(accessRec.reqBody).toBeDefined();
        expect(accessRec.reqBody.name).toBe("kiro");
        expect(accessRec.resBody).toBeDefined();
        expect(accessRec.resBody.received).toBe("kiro");
    });
    it.each(NON_TRACE_WITH_OUTPUT)("Property 6: at level=%s, access log does NOT include reqBody or resBody", async (level) => {
        const { app, capture } = makeHarnessApp(level, (a) => {
            a.post("/echo", (req, res) => {
                res.body = { received: req.body.name };
                res.json({ received: req.body.name });
            });
        });
        await request(app).post("/echo").send({ name: "kiro" }).expect(200);
        await flushNextTick();
        const accessRec = capture.records().find((r) => r.req);
        expect(accessRec).toBeDefined();
        expect(accessRec.reqBody).toBeUndefined();
        expect(accessRec.resBody).toBeUndefined();
    });
    it("Property 6 (vacuous): at level=warn, no access log is emitted for status 200, so body absence holds vacuously", async () => {
        const { app, capture } = makeHarnessApp("warn", (a) => {
            a.post("/echo", (req, res) => res.json({ received: req.body.name }));
        });
        await request(app).post("/echo").send({ name: "kiro" }).expect(200);
        await flushNextTick();
        const accessRec = capture.records().find((r) => r.req);
        expect(accessRec).toBeUndefined();
    });
});
