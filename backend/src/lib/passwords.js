import crypto from "node:crypto";

const KEY_LENGTH = 64;

function scryptAsync(value, salt) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(value, salt, KEY_LENGTH, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey);
    });
  });
}

export async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = await scryptAsync(password, salt);
  return `${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(":")) return false;

  const [salt, hash] = storedHash.split(":");
  const derivedKey = await scryptAsync(password, salt);
  const originalBuffer = Buffer.from(hash, "hex");
  const derivedBuffer = Buffer.from(derivedKey.toString("hex"), "hex");

  if (originalBuffer.length !== derivedBuffer.length) return false;
  return crypto.timingSafeEqual(originalBuffer, derivedBuffer);
}
