
import { Router } from "express";
import {
  getEventsController,
  createEventController,
  updateEventController
} from "../controllers/events.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeMiddleware } from "../middlewares/authorize.middleware.js";

const router = Router();

router.get("/", getEventsController);

router.post(
  "/",
  authMiddleware,
  authorizeMiddleware("organizer", "admin"),
  createEventController
);

router.patch(
  "/:id",
  authMiddleware,
  authorizeMiddleware("organizer", "admin"),
  updateEventController
);

export default router;
