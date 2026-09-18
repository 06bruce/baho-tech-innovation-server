import { Router } from "express";
import { body } from "express-validator";
import { contact } from "../controllers/contact.controller.js";
import { handleValidation } from "../middlewares/validate.middleware.js";
import { adminRoutes } from "../modules/admin/admin.routes.js";
import { accessibilityRoutes } from "../modules/accessibility/accessibility.routes.js";
import { aiAssistantRoutes } from "../modules/ai-assistant/ai-assistant.routes.js";
import { authRoutes } from "../modules/auth/auth.routes.js";
import { contentRoutes } from "../modules/content/content.routes.js";
import { disabilityRoutes } from "../modules/disability/disability.routes.js";
import { signLanguageRoutes } from "../modules/sign-language/sign-language.routes.js";
import { speechRoutes } from "../modules/speech/speech.routes.js";
import { themeRoutes } from "../modules/theme/theme.routes.js";
import { translationRoutes } from "../modules/translation/translation.routes.js";
import { userRoutes } from "../modules/users/users.routes.js";
import { visionRoutes } from "../modules/vision/vision.routes.js";
import { writingRoutes } from "../modules/writing/writing.routes.js";

export const apiRoutes = Router();

apiRoutes.get("/health", (_req, res) => res.json({ ok: true }));

const contactValidation = [
  body("name").trim().notEmpty().withMessage("Name is required.").isLength({ max: 120 }),
  body("email").trim().isEmail().withMessage("A valid email address is required.").normalizeEmail({
    all_lowercase: true,
    gmail_remove_dots: false,
    gmail_remove_subaddress: false,
    gmail_convert_googlemaildotcom: false,
    outlookdotcom_remove_subaddress: false,
    yahoo_remove_subaddress: false,
    icloud_remove_subaddress: false,
  }),
  body("subject").trim().notEmpty().withMessage("Subject is required.").isLength({ max: 200 }),
  body("message").trim().notEmpty().withMessage("Message is required.").isLength({ max: 5000 }),
];

apiRoutes.post("/contact", contactValidation, handleValidation, contact);
apiRoutes.use("/auth", authRoutes);
apiRoutes.use("/admin", adminRoutes);
apiRoutes.use("/content", contentRoutes);
apiRoutes.use("/users", userRoutes);
apiRoutes.use("/disability", disabilityRoutes);
apiRoutes.use("/speech", speechRoutes);
apiRoutes.use("/theme", themeRoutes);
apiRoutes.use("/translation", translationRoutes);
apiRoutes.use("/accessibility", accessibilityRoutes);
apiRoutes.use("/ai-assistant", aiAssistantRoutes);
apiRoutes.use("/writing", writingRoutes);
apiRoutes.use("/vision", visionRoutes);
apiRoutes.use("/sign-language", signLanguageRoutes);
