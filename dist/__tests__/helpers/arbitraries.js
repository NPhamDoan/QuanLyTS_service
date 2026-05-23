import fc from "fast-check";
import { VALID_LEVELS } from "../../logger.js";
/** Một level pino hợp lệ. */
export const arbValidLevel = fc.constantFrom(...VALID_LEVELS);
/**
 * Chuỗi có khả năng cao là KHÔNG phải level hợp lệ (kể cả empty). Lọc ra
 * mọi giá trị trùng VALID_LEVELS để tránh false positive trong Property 2.
 */
export const arbInvalidLevel = fc
    .string({ maxLength: 16 })
    .filter((s) => !VALID_LEVELS.includes(s));
/** Tên trường nhạy cảm (MaskedField). */
export const MASKED_FIELDS = [
    "matKhau",
    "matKhauHash",
    "password",
    "token",
    "accessToken",
    "refreshToken",
    "authorization",
    "cccd",
    "email",
];
export const arbMaskedField = fc.constantFrom(...MASKED_FIELDS);
/**
 * Một giá trị bí mật. Dùng chỉ alphanumeric + ít ký tự an toàn để tránh
 * substring trùng với cú pháp JSON (như `,`, `:`, `"`, `}`). Đồng thời
 * yêu cầu độ dài tối thiểu để giảm xác suất trùng nhãn key trong output.
 */
export const arbSecretValue = fc
    .stringMatching(/^[A-Za-z0-9_-]{8,24}$/)
    .filter((s) => s !== "[REDACTED]" && !/^(REDACTED)$/i.test(s));
/** Cặp (callLevel, configuredLevel) để kiểm tra ngưỡng pino. */
export const LEVEL_WEIGHTS = {
    trace: 10,
    debug: 20,
    info: 30,
    warn: 40,
    error: 50,
    fatal: 60,
    silent: Infinity,
};
export const arbMaskedSample = fc
    .tuple(fc.subarray([...MASKED_FIELDS], { minLength: 1 }), fc.stringMatching(/^[A-Za-z0-9]{8,16}$/))
    .map(([fields, baseSecret]) => {
    const secrets = [];
    const payload = {
        req: { headers: {}, body: { data: {} } },
        res: { body: {}, headers: {} },
        params: { data: {} },
    };
    for (let i = 0; i < fields.length; i += 1) {
        const f = fields[i];
        const v = `${baseSecret}-${i}`;
        // top-level
        payload[f] = v;
        secrets.push({ path: f, value: v });
        // req.headers (chỉ áp dụng cho authorization theo cấu hình thực)
        if (f === "authorization") {
            payload.req.headers.authorization = v + "-h";
            secrets.push({ path: "req.headers.authorization", value: v + "-h" });
        }
        // req.body.<f> (cấu hình logger có path này cho hầu hết MaskedField,
        // ngoại trừ authorization). authorization ở body không nằm trong
        // REDACT_PATHS nên bỏ qua.
        if (f !== "authorization") {
            payload.req.body[f] = v + "-b";
            secrets.push({ path: `req.body.${f}`, value: v + "-b" });
            // req.body.data.<f>
            payload.req.body.data[f] = v + "-bd";
            secrets.push({ path: `req.body.data.${f}`, value: v + "-bd" });
            // params.<f>
            payload.params[f] = v + "-p";
            secrets.push({ path: `params.${f}`, value: v + "-p" });
            // params.data.<f>
            payload.params.data[f] = v + "-pd";
            secrets.push({ path: `params.data.${f}`, value: v + "-pd" });
        }
        // res.body — pino-http binding; chỉ accessToken/refreshToken/token
        if (f === "accessToken" || f === "refreshToken" || f === "token") {
            payload.res.body[f] = v + "-r";
            secrets.push({ path: `res.body.${f}`, value: v + "-r" });
        }
    }
    return { payload, secrets };
});
