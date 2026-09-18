import { DISABILITY_CATEGORIES, toPublicUser, USER_ROLES } from "../../models/user.model.js";
import { hashPassword } from "../../utils/password.js";
import { getDashboardAccessForUser } from "../disability/disability.service.js";
import { createUser } from "../auth/auth.repository.js";
import {
  countUsers,
  countUsersByDisability,
  findAdmins,
  findRecentUsers,
  findUserDetails,
  findUsers,
} from "./admin.repository.js";

export async function getAdminStats() {
  const usersByDisability = Object.fromEntries(DISABILITY_CATEGORIES.map((category) => [category, 0]));

  for (const row of await countUsersByDisability()) {
    usersByDisability[row.category] = row.count;
  }

  return {
    totalUsers: await countUsers(),
    usersByDisability,
    recentRegistrations: (await findRecentUsers()).map(toPublicUser),
  };
}

export async function listUsers(filters) {
  return (await findUsers(filters)).map(toPublicUser);
}

export async function listAdmins(filters = {}) {
  return (await findAdmins(filters)).map((user) => toPublicUser(user));
}

export async function createAdmin({ fullName, email, password, status = "active" }) {
  const normalizedEmail = String(email || "").trim();
  if (!fullName || !normalizedEmail || !password) {
    const error = new Error("Full name, email, and password are required.");
    error.status = 400;
    throw error;
  }

  const existing = await findAdmins({ search: normalizedEmail });
  if (existing.some((user) => user.email.toLowerCase() === normalizedEmail.toLowerCase())) {
    const error = new Error("An admin account already exists for this email.");
    error.status = 409;
    throw error;
  }

  const { hash, salt, scheme } = hashPassword(password);
  const user = await createUser({
    fullName,
    email: normalizedEmail,
    passwordHash: hash,
    passwordSalt: salt,
    passwordScheme: scheme,
    role: USER_ROLES.ADMIN,
    status,
    disabilityCategory: null,
  });

  return toPublicUser(user);
}

export async function getUserDetails(id) {
  const user = await findUserDetails(id);
  if (!user) {
    const error = new Error("User not found.");
    error.status = 404;
    throw error;
  }

  return {
    user: toPublicUser(user),
    access: getDashboardAccessForUser(user),
  };
}