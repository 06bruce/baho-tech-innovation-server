#!/usr/bin/env node
// Creates an admin user in the users collection.
// Usage:
//   node scripts/create-admin.js                       → generates random email + password
//   node scripts/create-admin.js email pass@example    → uses the provided credentials
// Skips silently if the email already exists (never overwrites).

import crypto from "node:crypto";
import { connectDatabase, disconnectDatabase } from "../src/database/connection.js";
import { User } from "../src/models/user.model.js";
import { hashPassword } from "../src/utils/password.js";
import { normalizeEmail } from "../src/utils/normalizers.js";

function randomString(len) {
  return crypto.randomBytes(len).toString("base64url");
}

function generateEmail() {
  const tag = randomString(4);
  return `admin${tag}@bahotech.dev`;
}

function generatePassword() {
  return randomString(15); // 15 bytes → ~20 chars, high entropy
}

async function main() {
  const [, , emailArg, passwordArg] = process.argv;
  const email = normalizeEmail(emailArg || generateEmail());
  const password = passwordArg || generatePassword();

  await connectDatabase();

  const existing = await User.exists({ email });
  if (existing) {
    console.log(`ℹ️  ${email} already exists — skipping (no changes).`);
    await disconnectDatabase();
    return;
  }

  const { hash, salt, scheme } = hashPassword(password);

  await User.create({
    fullName: "Dashboard Admin",
    email,
    passwordHash: hash,
    passwordSalt: salt,
    passwordScheme: scheme,
    role: "admin",
    preferredLanguage: "en",
    preferredTheme: "light",
    accessibilityPreferences: {},
  });

  await disconnectDatabase();

  console.log("");
  console.log("⚠️  ADMIN ACCOUNT CREATED — save these credentials now:");
  console.log(`   Email:    ${email}`);
  console.log(`   Password: ${password}`);
  console.log("");
}

main().catch((error) => {
  console.error("❌ Failed:", error.message);
  process.exitCode = 1;
});