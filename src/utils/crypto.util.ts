import crypto from "crypto";

// AES-256-GCM encryption for sensitive values (Google OAuth tokens) at rest.
// ENCRYPTION_KEY must be a 32-byte value; we accept either a 64-char hex
// string or any string (hashed down to 32 bytes with sha256) so setup stays
// forgiving in dev while still being correct in production.
const ALGORITHM = "aes-256-gcm";

const getKey = (): Buffer => {
  const raw = process.env.ENCRYPTION_KEY;

  if (!raw) {
    throw new Error(
      "ENCRYPTION_KEY is not defined. Set a 32-byte secret in your .env file."
    );
  }

  if (/^[0-9a-fA-F]{64}$/.test(raw)) {
    return Buffer.from(raw, "hex");
  }

  return crypto.createHash("sha256").update(raw).digest();
};

const encrypt = (plainText: string): string => {
  const key = getKey();
  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  // Store iv + authTag + ciphertext together, base64 encoded
  return Buffer.concat([iv, authTag, encrypted]).toString("base64");
};

const decrypt = (payload: string): string => {
  const key = getKey();
  const buffer = Buffer.from(payload, "base64");

  const iv = buffer.subarray(0, 12);
  const authTag = buffer.subarray(12, 28);
  const encrypted = buffer.subarray(28);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
};

export { encrypt, decrypt };
