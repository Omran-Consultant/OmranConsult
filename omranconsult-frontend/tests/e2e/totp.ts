import { createHmac } from "node:crypto";

const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

/** RFC 6238 TOTP (SHA-1, 30s, 6 digits) for Playwright — not a runtime dependency. */
export function generateTotp(secret: string, atMs = Date.now()): string {
  const key = decodeBase32(secret);
  const counter = Math.floor(atMs / 1000 / 30);
  const buf = Buffer.alloc(8);
  buf.writeUInt32BE(Math.floor(counter / 0x100000000), 0);
  buf.writeUInt32BE(counter >>> 0, 4);
  const hmac = createHmac("sha1", key).update(buf).digest();
  const offset = hmac[hmac.length - 1]! & 0xf;
  const bin =
    ((hmac[offset]! & 0x7f) << 24) |
    ((hmac[offset + 1]! & 0xff) << 16) |
    ((hmac[offset + 2]! & 0xff) << 8) |
    (hmac[offset + 3]! & 0xff);

  return String(bin % 1_000_000).padStart(6, "0");
}

function decodeBase32(input: string): Buffer {
  const cleaned = input.toUpperCase().replace(/[\s=]+/g, "");
  let bits = "";
  for (const char of cleaned) {
    const val = BASE32.indexOf(char);
    if (val < 0) {
      continue;
    }
    bits += val.toString(2).padStart(5, "0");
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(Number.parseInt(bits.slice(i, i + 8), 2));
  }

  return Buffer.from(bytes);
}
