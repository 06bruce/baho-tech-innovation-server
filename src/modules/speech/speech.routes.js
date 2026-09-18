import { Router } from "express";
import { body } from "express-validator";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { handleValidation } from "../../middlewares/validate.middleware.js";
import { capabilities, optimizeTextForSpeech, transcribeAudio } from "./speech.controller.js";

export const speechRoutes = Router();

const languageOptional = body("language").optional().isIn(["en", "rw", "fr", "sw"]).withMessage("language must be one of: en, rw, fr, sw.");
const mimeType = body("mimeType").isString().trim().notEmpty().withMessage("mimeType is required.");

speechRoutes.get("/capabilities", capabilities);

speechRoutes.post(
  "/transcribe",
  requireAuth,
  [body("audioBase64").isString().notEmpty().withMessage("audioBase64 is required."), mimeType, languageOptional],
  handleValidation,
  transcribeAudio
);

speechRoutes.post(
  "/optimize-tts",
  requireAuth,
  [body("text").isString().notEmpty().withMessage("text is required.").isLength({ max: 5000 }), languageOptional],
  handleValidation,
  optimizeTextForSpeech
);