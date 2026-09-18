import { Router } from "express";
import { body } from "express-validator";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { handleValidation } from "../../middlewares/validate.middleware.js";
import { assistWriting, translateWriting } from "./writing.controller.js";

export const writingRoutes = Router();

const languageOptional = body("language").optional().isIn(["en", "rw", "fr", "sw"]).withMessage("language must be one of: en, rw, fr, sw.");
const targetLanguageOptional = body("targetLanguage").optional().isIn(["en", "rw", "fr", "sw"]).withMessage("targetLanguage must be one of: en, rw, fr, sw.");

writingRoutes.use(requireAuth);

writingRoutes.post(
  "/assist",
  [body("input").isString().notEmpty().withMessage("input is required.").isLength({ max: 5000 }), body("mode").optional().isIn(["expand", "shorten", "rewrite"]), languageOptional],
  handleValidation,
  assistWriting
);

writingRoutes.post(
  "/translate",
  [body("text").isString().notEmpty().withMessage("text is required.").isLength({ max: 5000 }), targetLanguageOptional],
  handleValidation,
  translateWriting
);