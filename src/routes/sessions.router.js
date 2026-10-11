
import { Router } from "express";
import {
  getSessionsController,
  registerUserController,
  loginUserController,
  getCurrentUserController,
  logoutUserController
} from "../controllers/sessions.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", getSessionsController);
router.post("/register", registerUserController);
router.post("/login", loginUserController);
router.get("/current", authMiddleware, getCurrentUserController);
router.post("/logout", logoutUserController);

export default router;