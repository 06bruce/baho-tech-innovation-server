// Loads seed/fixture data into MongoDB. Run with `npm run seed`.
// Sources:
//   - seed/fixtures-users.json, seed/fixtures-messages.json  (representative dummy data)
//   - seed/legacy-users.json, seed/legacy-messages.json      (preserved SQLite export, pbkdf2 hashes intact)
//   - ADMIN_EMAIL / ADMIN_PASSWORD from the environment (admin account)
// Existing documents are never overwritten (email uniqueness is respected).
import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { connectDatabase, disconnectDatabase } from "../src/database/connection.js";
import { Message } from "../src/models/message.model.js";
import { Content } from "../src/models/content.model.js";
import { SUPPORTED_LANGUAGES, SUPPORTED_THEMES, USER_ROLES, User } from "../src/models/user.model.js";
import { hashLegacyPbkdf2, hashPassword } from "../src/utils/password.js";
import { normalizeEmail } from "../src/utils/normalizers.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seedDir = path.join(__dirname, "..", "seed");

async function readJson(name) {
  try {
    const raw = await readFile(path.join(seedDir, name), "utf8");
    return JSON.parse(raw);
  } catch (error) {
    console.warn(`  (skipping ${name}: ${error.message})`);
    return [];
  }
}

function normalizeOptional(payload) {
  const category = String(payload.disabilityCategory || "").trim().toLowerCase();
  const language = String(payload.preferredLanguage || "").trim().toLowerCase();
  const theme = String(payload.preferredTheme || "").trim().toLowerCase();

  return {
    fullName: String(payload.fullName || "").trim(),
    email: normalizeEmail(payload.email),
    disabilityCategory: ["blind", "deaf", "mute", "mobility"].includes(category) ? category : null,
    preferredLanguage: SUPPORTED_LANGUAGES.includes(language) ? language : "en",
    preferredTheme: SUPPORTED_THEMES.includes(theme) ? theme : "light",
    accessibilityPreferences:
      payload.accessibilityPreferences && typeof payload.accessibilityPreferences === "object"
        ? payload.accessibilityPreferences
        : {},
    phone: payload.phone ? String(payload.phone).trim() : null,
    location: payload.location ? String(payload.location).trim() : null,
  };
}

async function seedFixtureUsers(fixtures) {
  let created = 0;
  for (const fixture of fixtures) {
    const normalized = normalizeOptional(fixture);
    if (!normalized.fullName || !normalized.email) continue;

    const exists = await User.exists({ email: normalized.email });
    if (exists) continue;

    const { hash, salt, scheme } = hashPassword(fixture.password || "ChangeMe123!");
    await User.create({
      ...normalized,
      passwordHash: hash,
      passwordSalt: salt,
      passwordScheme: scheme,
      role: fixture.role === USER_ROLES.ADMIN ? USER_ROLES.ADMIN : USER_ROLES.USER,
    });
    created += 1;
  }
  console.log(`  fixture users: ${created} created`);
}

async function seedLegacyUsers(rows) {
  let created = 0;
  for (const row of rows) {
    const email = normalizeEmail(row.email);
    if (!email) continue;

    const exists = await User.exists({ email });
    if (exists) continue;

    await User.create({
      fullName: row.full_name,
      email,
      passwordHash: row.password_hash,
      passwordSalt: row.password_salt,
      passwordScheme: "pbkdf2",
      role: row.role === USER_ROLES.ADMIN ? USER_ROLES.ADMIN : USER_ROLES.USER,
      disabilityCategory: ["blind", "deaf", "mute", "mobility"].includes(row.disability_category)
        ? row.disability_category
        : null,
      preferredLanguage: SUPPORTED_LANGUAGES.includes(row.preferred_language) ? row.preferred_language : "en",
      preferredTheme: SUPPORTED_THEMES.includes(row.preferred_theme) ? row.preferred_theme : "light",
      accessibilityPreferences: parseLegacyPreferences(row.accessibility_preferences),
      phone: row.phone || null,
      location: row.location || null,
      createdAt: row.created_at ? new Date(row.created_at) : undefined,
      updatedAt: row.updated_at ? new Date(row.updated_at) : undefined,
    });
    created += 1;
  }
  console.log(`  legacy users: ${created} created (pbkdf2 hashes preserved)`);
}

function parseLegacyPreferences(value) {
  if (!value) return {};
  try {
    return JSON.parse(value);
  } catch (_error) {
    return {};
  }
}

async function seedMessages(rows) {
  let created = 0;
  for (const payload of rows) {
    const email = normalizeEmail(payload.email);
    if (!payload.name || !email || !payload.subject || !payload.message) continue;
    const exists = await Message.exists({
      email,
      subject: String(payload.subject).trim(),
      message: String(payload.message).trim(),
    });
    if (exists) continue;
    await Message.create({
      name: String(payload.name).trim(),
      email,
      subject: String(payload.subject).trim(),
      message: String(payload.message).trim(),
      createdAt: payload.createdAt ? new Date(payload.createdAt) : undefined,
    });
    created += 1;
  }
  console.log(`  messages: ${created} created`);
}

async function seedContent(rows) {
  let created = 0;
  for (const payload of rows) {
    if (!payload.type || !payload.slug || !payload.title) continue;

    const existing = await Content.findOne({ type: payload.type, slug: payload.slug });
    if (existing) {
      if (payload.metadata?.gallery && !existing.metadata?.gallery?.length) {
        existing.metadata = { ...(existing.metadata || {}), gallery: payload.metadata.gallery };
        await existing.save();
      }
      continue;
    }

    await Content.create({
      ...payload,
      isPublished: payload.isPublished !== false,
      tags: Array.isArray(payload.tags) ? payload.tags : [],
      story: Array.isArray(payload.story) ? payload.story : [],
      metadata: payload.metadata && typeof payload.metadata === "object" ? payload.metadata : {},
    });
    created += 1;
  }
  console.log(`  content: ${created} created`);
}

async function main() {
  await connectDatabase();

  console.log("Seeding users...");
  let seedUsers = [];
  try {
    seedUsers = JSON.parse(await readFile(path.join(seedDir, "fixtures-users.json"), "utf8"));
  } catch (error) {
    console.warn(`  (skipping fixtures-users.json: ${error.message})`);
  }
  await seedFixtureUsers(seedUsers);

  const legacyUsers = await readJson("legacy-users.json");
  await seedLegacyUsers(legacyUsers);

  console.log("Seeding messages...");
  const fixtureMessages = await readJson("fixtures-messages.json");
  const legacyMessages = await readJson("legacy-messages.json");
  await seedMessages([...fixtureMessages, ...legacyMessages]);

  console.log("Seeding content...");
  const contentRows = await readJson("content.json");
  await seedContent(contentRows);

  const totalUsers = await User.countDocuments();
  const totalMessages = await Message.countDocuments();
  const totalContent = await Content.countDocuments();
  console.log(`\nDone. MongoDB now has: ${totalUsers} users, ${totalMessages} messages, ${totalContent} content items`);

  await disconnectDatabase();
}

const isEntrypoint = Boolean(process.argv[1]) && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isEntrypoint) {
  main().catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exitCode = 1;
  });
}