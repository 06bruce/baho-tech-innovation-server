import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function signAccessToken(user) {
  return jwt.sign(
    {
      sub: String(user._id || user.id),
      role: user.role,
      tv: user.tokenVersion ?? 0,
    },
    env.jwtSecret,
    { expiresIn: env.accessTokenTtlMs / 1000 }
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

export function signRefreshToken(user) {
  return jwt.sign(
    {
      sub: String(user._id || user.id),
      kind: "refresh",
    },
    env.jwtRefreshSecret,
    { expiresIn: env.refreshTokenTtlDays * 24 * 60 * 60 }
  );
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwtRefreshSecret);
}