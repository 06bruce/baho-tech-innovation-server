import { clearRefreshTokens, findUserById } from "../modules/auth/auth.repository.js";
import { USER_ROLES } from "../models/user.model.js";
import { verifyAccessToken } from "../utils/jwt.js";

function unauthorized(res, message = "Authentication is required.") {
  return res.status(401).json({ ok: false, error: message, code: "UNAUTHORIZED" });
}

/**
 * Verifies the JWT access token, then re-reads the user from the database so
 * revoked tokens (tokenVersion change) and stale role claims are caught.
 */
export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";

  if (!token) {
    return unauthorized(res);
  }

  try {
    const payload = verifyAccessToken(token);

    const user = await findUserById(payload.sub);
    if (!user) {
      return unauthorized(res, "Your account no longer exists.");
    }

    if (user.tokenVersion !== (payload.tv ?? 0)) {
      return unauthorized(res, "Your session has been revoked. Please log in again.");
    }

    req.user = user;
    req.tokenPayload = payload;
    return next();
  } catch (error) {
    if (error?.name === "TokenExpiredError") {
      return unauthorized(res, "Your session has expired. Please log in again.");
    }
    if (error?.name === "JsonWebTokenError") {
      return unauthorized(res);
    }
    return next(error);
  }
}

export async function requireAdmin(req, res, next) {
  if (req.user?.role !== USER_ROLES.ADMIN) {
    return res.status(403).json({ ok: false, error: "Admin access is required.", code: "FORBIDDEN" });
  }

  return next();
}

/** Revokes every refresh token for a user (e.g. forced sign-out). */
export async function revokeAllUserSessions(userId) {
  await clearRefreshTokens(userId);
}