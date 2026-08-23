import { Router } from "express";

import * as googleAuthController from "../controllers/googleAuth.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// Callback has no Authorization header (Google redirects the browser here directly)
router.get("/callback", googleAuthController.callback);

router.get("/connect", authenticate, googleAuthController.connect);
router.delete("/disconnect", authenticate, googleAuthController.disconnect);

export default router;
