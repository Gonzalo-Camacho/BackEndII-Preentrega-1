import { Router } from "express";
import {
  getSessionsController,
  registerUserController
} from "../controllers/sessions.controller.js";

const router = Router();

router.get("/", getSessionsController);
router.post("/register", registerUserController);

export default router;
