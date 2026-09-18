import { User } from "../../models/user.model.js";
import { normalizeEmail } from "../../utils/normalizers.js";

export async function findUserByEmail(email) {
  return User.findOne({ email: normalizeEmail(email) });
}

export async function findUserById(id) {
  return User.findById(id);
}

export async function createUser({
  fullName,
  email,
  passwordHash,
  passwordSalt,
  passwordScheme,
  role = "user",
  status = "active",
  disabilityCategory,
  preferredLanguage,
  preferredTheme,
  phone,
  location,
}) {
  return User.create({
    fullName,
    email: normalizeEmail(email),
    passwordHash,
    passwordSalt,
    passwordScheme,
    role,
    status,
    disabilityCategory,
    preferredLanguage,
    preferredTheme,
    phone,
    location,
    accessibilityPreferences: {},
  });
}

export async function addRefreshToken(userId, { tokenHash, expiresAt }) {
  await User.updateOne(
    { _id: userId },
    { $push: { refreshTokens: { tokenHash, expiresAt } } }
  );
}

export async function removeRefreshToken(userId, tokenHash) {
  await User.updateOne(
    { _id: userId },
    { $pull: { refreshTokens: { tokenHash } } }
  );
}

export async function clearRefreshTokens(userId) {
  await User.updateOne({ _id: userId }, { $set: { refreshTokens: [] } });
}

export async function findUserByRefreshToken(tokenHash) {
  return User.findOne({ "refreshTokens.tokenHash": tokenHash });
}

export async function pruneExpiredRefreshTokens(userId) {
  await User.updateOne(
    { _id: userId },
    { $pull: { refreshTokens: { expiresAt: { $lte: new Date() } } } }
  );
}

export async function incrementTokenVersion(userId) {
  await User.updateOne({ _id: userId }, { $inc: { tokenVersion: 1 }, $set: { refreshTokens: [] } });
}

export async function deleteExpiredSessions() {
  await User.updateMany(
    {},
    { $pull: { refreshTokens: { expiresAt: { $lte: new Date() } } } }
  );
}