import { Router } from "express";
import { body } from "express-validator";
import { handleValidation } from "../../middlewares/validate.middleware.js";
import { languageOptions, translateDynamicContent } from "./translation.controller.js";

export const translationRoutes = Router();

translationRoutes.get("/languages", languageOptions);

translationRoutes.post(
  "/translate",
  [
    body("text").isString().notEmpty().withMessage("text is required.").isLength({ max: 1200 }).withMessage("Text is too long to translate in one request."),
    body("targetLanguage").optional().isIn(["en", "rw", "fr", "sw"]).withMessage("targetLanguage must be one of: en, rw, fr, sw."),
  ],
  handleValidation,
  translateDynamicContent
);