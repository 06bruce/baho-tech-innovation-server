import { Router } from "express";
import { body } from "express-validator";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { handleValidation } from "../../middlewares/validate.middleware.js";
import { analyzeVision } from "./vision.controller.js";

export const visionRoutes = Router();

visionRoutes.use(requireAuth);

visionRoutes.post(
  "/analyze",
  [
    body("imageBase64").isString().notEmpty().withMessage("imageBase64 is required."),
    body("mimeType").isString().trim().notEmpty().withMessage("mimeType is required."),
    body("task").optional().isString().trim().isLength({ max: 200 }),
    body("language").optional().isIn(["en", "rw", "fr", "sw"]).withMessage("language must be one of: en, rw, fr, sw."),
  ],
  handleValidation,
  analyzeVision
);