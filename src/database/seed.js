import { env } from "../config/env.js";
import { USER_ROLES, User } from "../models/user.model.js";
import { hashPassword } from "../utils/password.js";
import { normalizeEmail } from "../utils/normalizers.js";

/**
 * Ensure the configured admin account exists (seeded from ADMIN_EMAIL/ADMIN_PASSWORD).
 * Password changes to ADMIN_PASSWORD in the environment do NOT overwrite an
 * existing admin — update it through the UI/DB instead (same behaviour as before).
 */
export async function ensureAdminUser() {
  if (!env.admin.email || !env.admin.password) return;

  const email = normalizeEmail(env.admin.email);
  const existing = await User.findOne({ email }).select("+passwordHash");
  if (existing) return;

  const { hash, salt, scheme } = hashPassword(env.admin.password);

  await User.create({
    fullName: env.admin.name,
    email,
    passwordHash: hash,
    passwordSalt: salt,
    passwordScheme: scheme,
    role: USER_ROLES.ADMIN,
    preferredLanguage: "en",
    preferredTheme: "light",
    accessibilityPreferences: {},
  });

  console.log(`✅ Admin account ensured (${email})`);
}