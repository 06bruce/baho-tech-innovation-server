import { User } from "../../models/user.model.js";
import { normalizeDisabilityCategory } from "../../utils/normalizers.js";

export async function countUsers() {
  return User.countDocuments({ role: "user" });
}

export async function countUsersByDisability() {
  const pipeline = [
    { $match: { role: "user", disabilityCategory: { $ne: null } } },
    { $group: { _id: "$disabilityCategory", count: { $sum: 1 } } },
  ];
  const rows = await User.aggregate(pipeline);
  return rows.map((row) => ({ category: row._id, count: row.count }));
}

export async function findRecentUsers(limit = 6) {
  return User.find({ role: "user" })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select("fullName email role disabilityCategory phone location createdAt updatedAt");
}

export async function findUsers({ search = "", disability = "" } = {}) {
  const query = { role: "user" };
  const category = normalizeDisabilityCategory(disability);
  const normalizedSearch = String(search || "").trim().toLowerCase();

  if (category) {
    query.disabilityCategory = category;
  }

  if (normalizedSearch) {
    const escaped = normalizedSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "i");
    query.$or = [{ fullName: regex }, { email: regex }];
  }

  return User.find(query)
    .sort({ createdAt: -1 })
    .select("fullName email role disabilityCategory preferredLanguage preferredTheme accessibilityPreferences phone location createdAt updatedAt");
}

export async function findAdmins({ search = "" } = {}) {
  const query = { role: "admin" };
  const normalizedSearch = String(search || "").trim().toLowerCase();

  if (normalizedSearch) {
    const escaped = normalizedSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "i");
    query.$or = [{ fullName: regex }, { email: regex }];
  }

  return User.find(query)
    .sort({ createdAt: -1 })
    .select("fullName email role status disabilityCategory preferredLanguage preferredTheme accessibilityPreferences phone location createdAt updatedAt");
}

export async function findUserDetails(id) {
  return User.findById(id)
    .select("fullName email role disabilityCategory preferredLanguage preferredTheme accessibilityPreferences phone location createdAt updatedAt");
}