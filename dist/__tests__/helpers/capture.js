import { Writable } from "node:stream";
import { createLogger } from "../../logger.js";
/**
 * Stream tích lũy mọi chunk được pino ghi vào, để test parse từng dòng JSON.
 *
 * Pino mặc định ghi mỗi record là một dòng terminated bằng '\n'. Chúng ta
 * phải buffer và split theo '\n' để hỗ trợ trường hợp nhiều record cùng lần
 * write (rất hiếm với SonicBoom default), hoặc bị split giữa chunks.
 */
export class CaptureStream extends Writable {
    constructor() {
        super(...arguments);
        this.buffer = "";
        this.lines = [];
    }
    _write(chunk, _encoding, callback) {
        this.buffer += chunk.toString();
        const parts = this.buffer.split("\n");
        this.buffer = parts.pop() ?? "";
        for (const part of parts) {
            if (part.length > 0)
                this.lines.push(part);
        }
        callback();
    }
    /** Flush buffer: bất cứ phần dư nào (không kết thúc bằng \n) cũng coi là
     * 1 line. */
    flushLines() {
        if (this.buffer.length > 0) {
            this.lines.push(this.buffer);
            this.buffer = "";
        }
        return this.lines;
    }
    /** Parse mọi line đã capture thành JSON object. */
    records() {
        return this.flushLines().map((l) => JSON.parse(l));
    }
    reset() {
        this.buffer = "";
        this.lines = [];
    }
}
/**
 * Build một logger mới + capture stream, cô lập hoàn toàn khỏi singleton
 * trong logger.ts. Dùng cho property tests cần override LOG_LEVEL nhiều
 * lần.
 */
export function makeIsolatedLogger(opts = {}) {
    const capture = new CaptureStream();
    const logger = createLogger({ ...opts, destination: capture });
    return { logger, capture };
}
