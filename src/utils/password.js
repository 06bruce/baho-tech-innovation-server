import bcrypt from "bcryptjs";
import crypto from "crypto";

const BCRYPT_ROUNDS = 10;
const PBKDF2_ITERATIONS = 120000;

export function hashPassword(password) {
  const hash = bcrypt.hashSync(String(password), BCRYPT_ROUNDS);
  return { hash, salt: null, scheme: "bcrypt" };
}

export function verifyPassword(password, user) {
  if (!user || !user.passwordHash) return false;

  if (user.passwordScheme === "pbkdf2") {
    const { hash } = hashLegacyPbkdf2(password, user.passwordSalt);
    const stored = Buffer.from(user.passwordHash, "hex");
    const candidate = Buffer.from(hash, "hex");
    return stored.length === candidate.length && crypto.timingSafeEqual(stored, candidate);
  }

  const plain = String(password);
  return bcrypt.compareSync(plain, user.passwordHash);
}

export function hashLegacyPbkdf2(password, salt) {
  return {
    hash: crypto.pbkdf2Sync(String(password), String(salt), PBKDF2_ITERATIONS, 64, "sha512").toString("hex"),
  };
}