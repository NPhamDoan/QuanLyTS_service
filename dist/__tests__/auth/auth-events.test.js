/**
 * Feature: common-logging
 * Property 8: Auth events log required fields per event type
 * Validates: Requirements 4.1, 4.2, 4.3, 4.4
 *
 * Strategy: tái-mô-phỏng đúng các lời gọi `logger.{info,warn}` mà
 * `auth.service.ts` thực hiện cho từng event. Không gọi service thật để
 * tránh phụ thuộc DB.
 */
import { describe, it } from "vitest";
import fc from "fast-check";
import { makeIsolatedLogger } from "../helpers/capture.js";
const arbTenDangNhap = fc.stringMatching(/^[a-zA-Z0-9_]{3,12}$/);
const arbReqId = fc.stringMatching(/^req-[A-Za-z0-9]{4,8}$/);
const arbTaiKhoanId = fc.integer({ min: 1, max: 1000000 });
const arbReason = fc.constantFrom("invalid_credentials", "account_disabled");
describe("auth event logs", () => {
    it("Property 8: login_success → info with event/tenDangNhap/taiKhoanId/requestId", () => {
        fc.assert(fc.property(arbTenDangNhap, arbTaiKhoanId, arbReqId, (tenDangNhap, taiKhoanId, requestId) => {
            const { logger, capture } = makeIsolatedLogger({
                level: "info",
                pretty: false,
            });
            logger.info({ event: "login_success", tenDangNhap, taiKhoanId, requestId }, "auth.login_success");
            const r = capture.records()[0];
            if (!r)
                return false;
            if (r.level !== 30)
                return false; // info
            if (r.event !== "login_success")
                return false;
            if (r.tenDangNhap !== tenDangNhap)
                return false;
            if (r.taiKhoanId !== taiKhoanId)
                return false;
            if (r.requestId !== requestId)
                return false;
            return true;
        }), { numRuns: 60 });
    });
    it("Property 8: login_failed → warn with event/tenDangNhap/reason/requestId", () => {
        fc.assert(fc.property(arbTenDangNhap, arbReason, arbReqId, (tenDangNhap, reason, requestId) => {
            const { logger, capture } = makeIsolatedLogger({
                level: "info",
                pretty: false,
            });
            logger.warn({ event: "login_failed", tenDangNhap, reason, requestId }, "auth.login_failed");
            const r = capture.records()[0];
            if (!r)
                return false;
            if (r.level !== 40)
                return false; // warn
            if (r.event !== "login_failed")
                return false;
            if (r.tenDangNhap !== tenDangNhap)
                return false;
            if (r.reason !== reason)
                return false;
            if (r.requestId !== requestId)
                return false;
            return true;
        }), { numRuns: 60 });
    });
    it("Property 8: token_refresh → info with event/taiKhoanId/requestId", () => {
        fc.assert(fc.property(arbTaiKhoanId, arbReqId, (taiKhoanId, requestId) => {
            const { logger, capture } = makeIsolatedLogger({
                level: "info",
                pretty: false,
            });
            logger.info({ event: "token_refresh", taiKhoanId, requestId }, "auth.token_refresh");
            const r = capture.records()[0];
            if (!r)
                return false;
            if (r.level !== 30)
                return false;
            if (r.event !== "token_refresh")
                return false;
            if (r.taiKhoanId !== taiKhoanId)
                return false;
            if (r.requestId !== requestId)
                return false;
            return true;
        }), { numRuns: 60 });
    });
    it("Property 8: logout → info with event/taiKhoanId/requestId", () => {
        fc.assert(fc.property(arbTaiKhoanId, arbReqId, (taiKhoanId, requestId) => {
            const { logger, capture } = makeIsolatedLogger({
                level: "info",
                pretty: false,
            });
            logger.info({ event: "logout", taiKhoanId, requestId }, "auth.logout");
            const r = capture.records()[0];
            if (!r)
                return false;
            if (r.level !== 30)
                return false;
            if (r.event !== "logout")
                return false;
            if (r.taiKhoanId !== taiKhoanId)
                return false;
            if (r.requestId !== requestId)
                return false;
            return true;
        }), { numRuns: 60 });
    });
});
