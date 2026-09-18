import { Router } from "express";
import { body } from "express-validator";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { handleValidation } from "../../middlewares/validate.middleware.js";
import { command, conversation, navigationHelp, screenReaderSummary } from "./ai-assistant.controller.js";

export const aiAssistantRoutes = Router();

const pageContextOptional = body("pageContext").optional().isObject().withMessage("pageContext must be an object.");
const languageOptional = body("language").optional().isIn(["en", "rw", "fr", "sw"]).withMessage("language must be one of: en, rw, fr, sw.");

aiAssistantRoutes.use(requireAuth);

aiAssistantRoutes.post(
  "/navigation-help",
  [body("message").optional().isString().trim().isLength({ max: 2000 }), pageContextOptional, languageOptional],
  handleValidation,
  navigationHelp
);

aiAssistantRoutes.post(
  "/screen-reader",
  [pageContextOptional, languageOptional],
  handleValidation,
  screenReaderSummary
);

aiAssistantRoutes.post(
  "/conversation",
  [
    body("messages").optional().isArray({ max: 40 }).withMessage("messages must be an array of at most 40 items."),
    pageContextOptional,
    languageOptional,
  ],
  handleValidation,
  conversation
);

aiAssistantRoutes.post(
  "/command",
  [
    body("command").isString().trim().notEmpty().withMessage("command is required.").isLength({ max: 1000 }),
    pageContextOptional,
    languageOptional,
  ],
  handleValidation,
  command
);