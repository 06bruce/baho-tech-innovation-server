import mongoose from "mongoose";

export const USER_ROLES = Object.freeze({
  ADMIN: "admin",
  USER: "user",
});

export const DISABILITY_CATEGORIES = Object.freeze(["blind", "deaf", "mute", "mobility"]);
export const SUPPORTED_LANGUAGES = Object.freeze(["en", "rw", "fr", "sw"]);
export const SUPPORTED_THEMES = Object.freeze(["light", "dark"]);

const refreshTokenSchema = new mongoose.Schema(
  {
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    passwordSalt: { type: String, default: null },
    passwordScheme: { type: String, enum: ["bcrypt", "pbkdf2"], default: "bcrypt" },
    role: { type: String, enum: Object.values(USER_ROLES), default: USER_ROLES.USER },
    status: { type: String, enum: ["active", "pending"], default: "active" },
    disabilityCategory: {
      type: String,
      enum: [...DISABILITY_CATEGORIES, null],
      default: null,
    },
    preferredLanguage: { type: String, enum: SUPPORTED_LANGUAGES, default: "en" },
    preferredTheme: { type: String, enum: SUPPORTED_THEMES, default: "light" },
    accessibilityPreferences: { type: mongoose.Schema.Types.Mixed, default: {} },
    phone: { type: String, default: null, trim: true },
    location: { type: String, default: null, trim: true },
    tokenVersion: { type: Number, default: 0 },
    refreshTokens: { type: [refreshTokenSchema], default: [] },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

export const User = mongoose.models.User || mongoose.model("User", userSchema);

export function toPublicUser(user) {
  if (!user) return null;

  return {
    id: user._id ? String(user._id) : user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    disabilityCategory: user.disabilityCategory ?? null,
    preferredLanguage: user.preferredLanguage || "en",
    preferredTheme: user.preferredTheme || "light",
    accessibilityPreferences: user.accessibilityPreferences || {},
    phone: user.phone ?? null,
    location: user.location ?? null,
    createdAt: user.createdAt ?? null,
    updatedAt: user.updatedAt ?? null,
  };
}