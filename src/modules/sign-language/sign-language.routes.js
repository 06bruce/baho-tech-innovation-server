import { Router } from "express";
import { body } from "express-validator";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { handleValidation } from "../../middlewares/validate.middleware.js";
import { interpretGesture } from "./sign-language.controller.js";

export const signLanguageRoutes = Router();

signLanguageRoutes.use(requireAuth);

signLanguageRoutes.post(
  "/interpret",
  [
    body("imageBase64").isString().notEmpty().withMessage("imageBase64 is required."),
    body("mimeType").isString().trim().notEmpty().withMessage("mimeType is required."),
    body("language").optional().isIn(["en", "rw", "fr", "sw"]).withMessage("language must be one of: en, rw, fr, sw."),
  ],
  handleValidation,
  interpretGesture
);