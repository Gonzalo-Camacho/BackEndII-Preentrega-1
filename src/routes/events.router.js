
import { Router } from "express";

import {
  getEventsController,
  getEventController,
  createEventController,
  updateEventController,
  changeEventStatusController
} from "../controllers/events.controller.js";

import {
  createTicketController,
  getEventTicketsController
} from "../controllers/ticket.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeMiddleware } from "../middlewares/authorize.middleware.js";

const router = Router();

router.get("/", getEventsController);

router.post(
  "/:eid/tickets",
  authMiddleware,
  createTicketController
);

router.get(
  "/:eid/tickets",
  authMiddleware,
  getEventTicketsController
);

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
