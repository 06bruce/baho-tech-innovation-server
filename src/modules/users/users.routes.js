import { Router } from "express";
import { body } from "express-validator";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { handleValidation } from "../../middlewares/validate.middleware.js";
import { dashboardAccess, profile, updatePreferences } from "./users.controller.js";

export const userRoutes = Router();

const updatePreferencesValidation = [
  body("preferredLanguage")
    .optional()
    .isIn(["en", "rw", "fr", "sw"])
    .withMessage("Preferred language must be one of: en, rw, fr, sw."),
  body("preferredTheme")
    .optional()
    .isIn(["light", "dark"])
    .withMessage("Preferred theme must be light or dark."),
  body("accessibilityPreferences")
    .optional()
    .isObject()
    .withMessage("Accessibility preferences must be an object."),
];

userRoutes.get("/profile", requireAuth, profile);
userRoutes.get("/dashboard-access", requireAuth, dashboardAccess);
userRoutes.patch("/preferences", requireAuth, updatePreferencesValidation, handleValidation, updatePreferences);