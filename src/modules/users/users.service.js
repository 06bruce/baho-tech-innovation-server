import { toPublicUser } from "../../models/user.model.js";
import { normalizeLanguage, normalizeTheme } from "../../utils/normalizers.js";
import { getDashboardAccessForUser } from "../disability/disability.service.js";
import { findUserById, updateUserPreferences } from "./users.repository.js";

export async function getUserProfile(userId) {
  const user = await findUserById(userId);
  return toPublicUser(user);
}

export function getDashboardAccess(user) {
  return getDashboardAccessForUser(user);
}

export async function saveUserPreferences(userId, payload = {}) {
  const preferences = {};

  if (payload.preferredLanguage) {
    preferences.preferredLanguage = normalizeLanguage(payload.preferredLanguage);
  }

  if (payload.preferredTheme) {
    preferences.preferredTheme = normalizeTheme(payload.preferredTheme);
  }

  if (payload.accessibilityPreferences && typeof payload.accessibilityPreferences === "object") {
    preferences.accessibilityPreferences = payload.accessibilityPreferences;
  }

  const user = await updateUserPreferences(userId, preferences);
  return toPublicUser(user);
}