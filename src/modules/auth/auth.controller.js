import { toPublicUser } from "../../models/user.model.js";
import { loginUser, logoutSession, refreshAccessToken, registerUserWithEmail } from "./auth.service.js";

export async function register(req, res, next) {
  try {
    const { user, email } = await registerUserWithEmail(req.validatedBody);
    return res.status(201).json({
      ok: true,
      message: "Registration successful. You can now log in.",
      user,
      email,
    });
  } catch (error) {
    return next(error);
  }
}

export async function login(req, res, next) {
  try {
    const result = await loginUser(req.validatedBody);
    return res.json({ ok: true, ...result });
  } catch (error) {
    return next(error);
  }
}

export async function refresh(req, res, next) {
  try {
    const result = await refreshAccessToken({ refreshToken: req.body?.refreshToken });
    return res.json({ ok: true, ...result });
  } catch (error) {
    return next(error);
  }
}

export function me(req, res) {
  return res.json({ ok: true, user: toPublicUser(req.user) });
}

export async function logout(req, res, next) {
  try {
    await logoutSession(req.user._id, req.body?.refreshToken);
    return res.json({ ok: true });
  } catch (error) {
    return next(error);
  }
}