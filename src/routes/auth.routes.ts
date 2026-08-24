//auth.route.ts
import express from "express";

import {
  register,
  login,
  getMe,
} from "../controllers/auth.controller"
import { validateBody } from "../middleware/validate.middleware";
import { registerSchema, loginSchema } from "../validators/schema";
import { authenticate } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, getMe);

export default router;
