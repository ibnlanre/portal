/**
 * Browser-compatible TypeScript implementation of HMAC-SHA256 cryptographic functions.
 * This implementation provides the same API as Node.js crypto module but works in browsers.
 */

const M = new Uint32Array(64);
const BLOCK_SIZE = 64;
const LITTLE_ENDIAN = (() => {
  try {
    return !!new Uint8Array(new Uint32Array([1]).buffer)[0];
  } catch (e) {
    return false;
  }
})();

function getFractionalBits(n: number): number {
  return ((n - (n | 0)) * 2 ** 32) | 0;
}

function rightRotate(word: number, bits: number): number {
  return (word >>> bits) | (word << (32 - bits));
}

function convertEndian(word: number): number {
  if (!LITTLE_ENDIAN) return word;
  return (
    (word >>> 24) |
    ((word >>> 8) & 0xff00) |
    ((word & 0xff00) << 8) |
    (word << 24)
  );
}

const DEFAULT_STATE = (() => {
  const state = new Uint32Array(8);
  let n = 2,
    nPrime = 0;
  while (nPrime < 8) {
    let isPrime = true;
    for (let i = 2; i <= Math.sqrt(n); i++) {
      if (n % i === 0) {
        isPrime = false;
        break;
      }
    }
    if (isPrime) {
      state[nPrime++] = getFractionalBits(Math.sqrt(n));
    }
    n++;
  }
  return state;
})();

const ROUND_CONSTANTS = (() => {
  const constants = [];
  let n = 2,
    nPrime = 0;
  while (nPrime < 64) {
    let isPrime = true;
    for (let i = 2; i <= Math.sqrt(n); i++) {
      if (n % i === 0) {
        isPrime = false;
        break;
      }
    }
    if (isPrime) {
      constants[nPrime++] = getFractionalBits(n ** (1 / 3));
    }
    n++;
  }
  return constants;
})();

export class SHA256 {
  public static hash(data: Uint8Array): Uint8Array {
    const state = DEFAULT_STATE.slice();
    const bitLength = data.length * 8;
    const paddedLength = ((bitLength + 64 + 511) >> 9) << 9;

    const buffer = new Uint8Array(paddedLength / 8);
    buffer.set(data);
    buffer[data.length] = 0x80;

    const words = new Uint32Array(buffer.buffer);
    words[words.length - 1] = convertEndian(bitLength);

    for (let i = 0; i < words.length; i += 16) {
      const w = M;
      for (let t = 0; t < 64; t++) {
        if (t < 16) w[t] = convertEndian(words[i + t]);
        else {
          const s0 =
            rightRotate(w[t - 15], 7) ^
            rightRotate(w[t - 15], 18) ^
            (w[t - 15] >>> 3);
          const s1 =
            rightRotate(w[t - 2], 17) ^
            rightRotate(w[t - 2], 19) ^
            (w[t - 2] >>> 10);
          w[t] = (w[t - 16] + s0 + w[t - 7] + s1) | 0;
        }
      }

      let [a, b, c, d, e, f, g, h] = state;

      for (let t = 0; t < 64; t++) {
        const S1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
        const ch = (e & f) ^ (~e & g);
        const temp1 = (h + S1 + ch + ROUND_CONSTANTS[t] + w[t]) | 0;
        const S0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
        const maj = (a & b) ^ (a & c) ^ (b & c);
        const temp2 = (S0 + maj) | 0;

        [h, g, f, e, d, c, b, a] = [
          g,
          f,
          e,
          (d + temp1) | 0,
          c,
          b,
          a,
          (temp1 + temp2) | 0,
        ];
      }

      for (let t = 0; t < 8; t++) {
        state[t] = (state[t] + [a, b, c, d, e, f, g, h][t]) | 0;
      }
    }

    return new Uint8Array(new Uint32Array(state.map(convertEndian)).buffer);
  }
}

function toUint8Array(input: string | Uint8Array): Uint8Array {
  return typeof input === "string" ? new TextEncoder().encode(input) : input;
}

function toHex(buf: Uint8Array): string {
  return Array.from(buf)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function toBase64(buf: Uint8Array): string {
  return btoa(String.fromCharCode(...buf));
}

function concat(a: Uint8Array, b: Uint8Array): Uint8Array {
  const res = new Uint8Array(a.length + b.length);
  res.set(a);
  res.set(b, a.length);
  return res;
}

class Hmac {
  private key: Uint8Array;
  private data: Uint8Array[] = [];

  constructor(key: string | Uint8Array) {
    this.key = toUint8Array(key);
    if (this.key.length > BLOCK_SIZE) this.key = SHA256.hash(this.key);
    if (this.key.length < BLOCK_SIZE) {
      const tmp = new Uint8Array(BLOCK_SIZE);
      tmp.set(this.key);
      this.key = tmp;
    }
  }

  update(data: string | Uint8Array): this {
    this.data.push(toUint8Array(data));
    return this;
  }

  digest(encoding: "base64" | "hex" | "binary" = "base64"): string {
    const msg = new Uint8Array(this.data.reduce((sum, a) => sum + a.length, 0));
    let offset = 0;
    for (const chunk of this.data)
      msg.set(chunk, offset), (offset += chunk.length);

    const oKeyPad = new Uint8Array(BLOCK_SIZE);
    const iKeyPad = new Uint8Array(BLOCK_SIZE);
    for (let i = 0; i < BLOCK_SIZE; i++) {
      iKeyPad[i] = this.key[i] ^ 0x36;
      oKeyPad[i] = this.key[i] ^ 0x5c;
    }

    const inner = SHA256.hash(concat(iKeyPad, msg));
    const result = SHA256.hash(concat(oKeyPad, inner));

    switch (encoding) {
      case "hex":
        return toHex(result);
      case "binary":
        return String.fromCharCode(...result);
      default:
        return toBase64(result);
    }
  }
}

export const createHmac = (algorithm: "sha256", key: string | Uint8Array) => {
  if (algorithm !== "sha256") throw new Error("Only 'sha256' is supported");
  return new Hmac(key);
};
