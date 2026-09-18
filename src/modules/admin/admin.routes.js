import { Router } from "express";
import { body, param, query } from "express-validator";
import { requireAdmin, requireAuth } from "../../middlewares/auth.middleware.js";
import { handleValidation } from "../../middlewares/validate.middleware.js";
import { admins, createAdminAccount, stats, userDetails, users } from "./admin.controller.js";

export const adminRoutes = Router();

// Every admin route explicitly chains authenticate + requireAdmin — there is no
// router-level fallback that could be accidentally omitted.

adminRoutes.get(
  "/stats",
  requireAuth,
  requireAdmin,
  stats
);

adminRoutes.get(
  "/overview",
  requireAuth,
  requireAdmin,
  stats
);

adminRoutes.get(
  "/users",
  requireAuth,
  requireAdmin,
  query("search").optional().isString().trim().isLength({ max: 120 }),
  query("disability").optional().isIn(["blind", "deaf", "mute", "mobility"]),
  handleValidation,
  users
);

adminRoutes.get(
  "/users/:id",
  requireAuth,
  requireAdmin,
  param("id").isMongoId().withMessage("A valid user id is required."),
  handleValidation,
  userDetails
);

adminRoutes.get(
  "/admins",
  requireAuth,
  requireAdmin,
  query("search").optional().isString().trim().isLength({ max: 120 }),
  handleValidation,
  admins
);

adminRoutes.post(
  "/admins",
  requireAuth,
  requireAdmin,
  body("fullName").trim().notEmpty().withMessage("Full name is required."),
  body("email").trim().isEmail().withMessage("A valid email address is required."),
  body("password").isLength({ min: 8, max: 128 }).withMessage("Password must be between 8 and 128 characters."),
  body("status").optional().isIn(["active", "pending"]).withMessage("Status must be active or pending."),
  handleValidation,
  createAdminAccount
);