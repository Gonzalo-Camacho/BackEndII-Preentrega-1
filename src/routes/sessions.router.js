import { Router } from "express";
import { getSessionsController } from "../controllers/sessions.controller.js";

const router = Router();

router.get("/", getSessionsController);

export default router;
