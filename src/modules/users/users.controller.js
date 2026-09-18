import { getDashboardAccess, getUserProfile, saveUserPreferences } from "./users.service.js";

export async function profile(req, res, next) {
  try {
    return res.json({ ok: true, user: await getUserProfile(req.user._id) });
  } catch (error) {
    return next(error);
  }
}

export function dashboardAccess(req, res) {
  return res.json({ ok: true, access: getDashboardAccess(req.user) });
}

export async function updatePreferences(req, res, next) {
  try {
    return res.json({ ok: true, user: await saveUserPreferences(req.user._id, req.validatedBody || {}) });
  } catch (error) {
    return next(error);
  }
}