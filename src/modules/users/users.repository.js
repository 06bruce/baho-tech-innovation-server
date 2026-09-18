import { User } from "../../models/user.model.js";

export function findUserById(id) {
  return User.findById(id);
}

export async function updateUserPreferences(id, { preferredLanguage, preferredTheme, accessibilityPreferences }) {
  const update = {};
  if (preferredLanguage !== undefined) update.preferredLanguage = preferredLanguage;
  if (preferredTheme !== undefined) update.preferredTheme = preferredTheme;
  if (accessibilityPreferences !== undefined) update.accessibilityPreferences = accessibilityPreferences;

  return User.findByIdAndUpdate(id, { $set: update }, { new: true });
}