import { Router } from "express";
import { body, param } from "express-validator";
import { requireAdmin, requireAuth } from "../../middlewares/auth.middleware.js";
import { handleValidation } from "../../middlewares/validate.middleware.js";
import {
  createAdminContent,
  deleteAdminContent,
  getAdminContentById,
  getPublicContent,
  listAdminContent,
  updateAdminContent,
} from "./content.controller.js";

export const contentRoutes = Router();

const contentTypeValidator = body("type")
  .optional()
  .isIn(["team", "project", "news"])
  .withMessage("type must be one of: team, project, news");

const contentPayloadValidation = [
  body("type").isIn(["team", "project", "news"]).withMessage("type is required and must be valid."),
  body("title").optional().isString().trim().isLength({ max: 200 }),
  body("name").optional().isString().trim().isLength({ max: 200 }),
  body("role").optional().isString().trim().isLength({ max: 200 }),
  body("bio").optional().isString().trim().isLength({ max: 2000 }),
  body("description").optional().isString().trim().isLength({ max: 2000 }),
  body("content").optional().isString().trim().isLength({ max: 5000 }),
  body("image").optional().isString().trim().isLength({ max: 500 }),
  body("imageAlt").optional().isString().trim().isLength({ max: 500 }),
  body("link").optional().isString().trim().isLength({ max: 500 }),
  body("location").optional().isString().trim().isLength({ max: 200 }),
  body("slug").optional().isString().trim().isLength({ max: 200 }),
  body("tags").optional().isArray(),
  body("story").optional().isArray(),
  body("sortOrder").optional().isInt({ min: -1000, max: 1000 }),
  body("isPublished").optional().isBoolean(),
  contentTypeValidator,
];

function publicContentRoute(type) {
  return (req, res, next) => {
    req.params.type = type;
    return getPublicContent(req, res, next);
  };
}

contentRoutes.get("/team", publicContentRoute("team"));
contentRoutes.get("/project", publicContentRoute("project"));
contentRoutes.get("/news", publicContentRoute("news"));

contentRoutes.use(requireAuth, requireAdmin);
contentRoutes.get("/", listAdminContent);
contentRoutes.post("/", contentPayloadValidation, handleValidation, createAdminContent);
contentRoutes.get("/:id", param("id").isMongoId().withMessage("A valid content id is required."), handleValidation, getAdminContentById);
contentRoutes.put("/:id", param("id").isMongoId().withMessage("A valid content id is required."), contentPayloadValidation, handleValidation, updateAdminContent);
contentRoutes.delete("/:id", param("id").isMongoId().withMessage("A valid content id is required."), handleValidation, deleteAdminContent);
