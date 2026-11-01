import { Router } from "express";

import {
  getMyTicketsController,
  cancelTicketController
} from "../controllers/ticket.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.get(
  "/my-tickets",
  authMiddleware,
  getMyTicketsController
);

router.patch(
  "/:tid/cancel",
  authMiddleware,
  cancelTicketController
);

export default router;