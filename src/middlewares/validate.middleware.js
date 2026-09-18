import { validationResult } from "express-validator";

/**
 * Runs express-validator chains attached to the request, then exposes the
 * sanitized body on `req.validatedBody`. Rejects with 422 + VALIDATION_ERROR
 * before the request ever reaches a controller.
 */
export function handleValidation(req, res, next) {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    return res.status(422).json({
      ok: false,
      error: result.array().map((item) => item.msg).join("; "),
      code: "VALIDATION_ERROR",
    });
  }

  req.validatedBody = req.body || {};
  return next();
}