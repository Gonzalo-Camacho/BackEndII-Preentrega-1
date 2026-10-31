
import { Router } from "express";

import {
  getEventsController,
  getEventController,
  createEventController,
  updateEventController,
  changeEventStatusController
} from "../controllers/events.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeMiddleware } from "../middlewares/authorize.middleware.js";

const router = Router();

router.get("/", getEventsController);

router.get("/:id", getEventController);

router.post(
  "/",
  authMiddleware,
  authorizeMiddleware("organizer", "admin"),
  createEventController
);

router.put(
  "/:id",
  authMiddleware,
  authorizeMiddleware("organizer", "admin"),
  updateEventController
);

router.patch(
  "/:id/status",
  authMiddleware,
  authorizeMiddleware("organizer", "admin"),
  changeEventStatusController
);

export default router;
