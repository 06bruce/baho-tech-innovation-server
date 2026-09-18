import { env } from "../../config/env.js";
import { toPublicUser } from "../../models/user.model.js";
import { sendWelcomeEmail } from "../../services/mail.service.js";
import { signAccessToken } from "../../utils/jwt.js";
import { hashPassword, verifyPassword } from "../../utils/password.js";
import { createRawToken, hashToken } from "../../utils/token.js";
import {
  addRefreshToken,
  clearRefreshTokens,
  createUser,
  findUserByEmail,
  findUserByRefreshToken,
  removeRefreshToken,
} from "./auth.repository.js";

function createApiError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

export async function registerUser(payload) {
  const existing = await findUserByEmail(payload.email);
  if (existing) {
    throw createApiError("An account already exists for this email.", 409);
  }

  const { hash, salt, scheme } = hashPassword(payload.password);
  const user = await createUser({
    fullName: payload.fullName,
    email: payload.email,
    passwordHash: hash,
    passwordSalt: salt,
    passwordScheme: scheme,
    disabilityCategory: payload.disabilityCategory,
    preferredLanguage: payload.preferredLanguage,
    preferredTheme: payload.preferredTheme,
    phone: payload.phone,
    location: payload.location,
  });

  return toPublicUser(user);
}

export async function registerUserWithEmail(payload) {
  const user = await registerUser(payload);

  try {
    const email = await sendWelcomeEmail(user);
    return { user, email };
  } catch (error) {
    return {
      user,
      email: {
        sent: false,
        reason: error instanceof Error ? error.message : "Welcome email failed.",
      },
    };
  }
}

/**
 * Unified login for users AND admins. The JWT `role` claim is taken from the
 * authenticated user's actual `role` in the database — there is no separate
 * admin login path.
 */
export async function loginUser({ email, password }) {
  const user = await findUserByEmail(email);

  if (!user || !verifyPassword(password, user)) {
    throw createApiError("Invalid email or password.", 401);
  }

  return issueTokens(user);
}

export async function issueTokens(user) {
  const accessToken = signAccessToken(user);
  const refreshToken = createRawToken();
  const expiresAt = new Date(Date.now() + env.refreshTokenTtlDays * 24 * 60 * 60 * 1000).toISOString();

  await addRefreshToken(user._id, {
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(expiresAt),
  });

  return {
    token: accessToken,
    refreshToken,
    tokenType: "Bearer",
    expiresAt,
    user: toPublicUser(user),
  };
}

export async function refreshAccessToken({ refreshToken }) {
  if (!refreshToken) {
    throw createApiError("Refresh token is required.", 401);
  }

  const tokenHash = hashToken(refreshToken);
  const user = await findUserByRefreshToken(tokenHash);

  if (!user) {
    throw createApiError("Invalid or expired refresh token.", 401);
  }

  const entry = user.refreshTokens.find((item) => item.tokenHash === tokenHash);
  if (!entry || new Date(entry.expiresAt).getTime() <= Date.now()) {
    throw createApiError("Invalid or expired refresh token.", 401);
  }

  // Rotate: revoke the used refresh token and issue a fresh pair.
  await removeRefreshToken(user._id, tokenHash);
  return issueTokens(user);
}

export async function logoutSession(userId, refreshToken) {
  if (refreshToken) {
    await removeRefreshToken(userId, hashToken(refreshToken));
  } else {
    await clearRefreshTokens(userId);
  }
}