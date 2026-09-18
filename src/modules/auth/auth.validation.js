import { body } from "express-validator";

export const registerValidation = [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required.")
    .isLength({ max: 120 })
    .withMessage("Full name must be at most 120 characters."),
  body("email")
    .trim()
    .isEmail()
    .withMessage("A valid email address is required.")
    .normalizeEmail({
      all_lowercase: true,
      gmail_remove_dots: false,
      gmail_remove_subaddress: false,
      gmail_convert_googlemaildotcom: false,
      outlookdotcom_remove_subaddress: false,
      yahoo_remove_subaddress: false,
      icloud_remove_subaddress: false,
    }),
  body("password")
    .isLength({ min: 8, max: 128 })
    .withMessage("Password must be between 8 and 128 characters."),
  body("confirmPassword")
    .custom((value, { req }) => {
      if (value !== req.body.password) throw new Error("Passwords do not match.");
      return true;
    }),
  body("disabilityCategory")
    .isIn(["blind", "deaf", "mute", "mobility"])
    .withMessage("Disability category must be one of: blind, deaf, mute, mobility."),
  body("preferredLanguage")
    .optional()
    .isIn(["en", "rw", "fr", "sw"])
    .withMessage("Preferred language must be one of: en, rw, fr, sw."),
  body("preferredTheme")
    .optional()
    .isIn(["light", "dark"])
    .withMessage("Preferred theme must be light or dark."),
  body("phone")
    .optional({ values: "null" })
    .trim()
    .isLength({ max: 30 })
    .withMessage("Phone number must be at most 30 characters."),
  body("location")
    .optional({ values: "null" })
    .trim()
    .isLength({ max: 120 })
    .withMessage("Location must be at most 120 characters."),
];

export const loginValidation = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("A valid email address is required.")
    .normalizeEmail({
      all_lowercase: true,
      gmail_remove_dots: false,
      gmail_remove_subaddress: false,
      gmail_convert_googlemaildotcom: false,
      outlookdotcom_remove_subaddress: false,
      yahoo_remove_subaddress: false,
      icloud_remove_subaddress: false,
    }),
  body("password")
    .notEmpty()
    .withMessage("Password is required."),
];