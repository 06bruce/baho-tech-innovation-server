import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { handleValidation } from "../../middlewares/validate.middleware.js";
import { login, logout, me, refresh, register } from "./auth.controller.js";
import { loginValidation, registerValidation } from "./auth.validation.js";

export const authRoutes = Router();

authRoutes.post("/register", registerValidation, handleValidation, register);
authRoutes.post("/login", loginValidation, handleValidation, login);
authRoutes.post("/refresh", refresh);
authRoutes.get("/me", requireAuth, me);
authRoutes.post("/logout", requireAuth, logout);