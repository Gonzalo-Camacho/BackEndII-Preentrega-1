
import { Router } from "express";
import passport from "../config/passport.config.js";
import {
  getSessionsController,
  registerUserController,
  loginUserController,
  getCurrentUserController,
  logoutUserController,
  getUsersController
} from "../controllers/sessions.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeMiddleware } from "../middlewares/authorize.middleware.js";

const router = Router();

router.get(
  "/users",
  authMiddleware,
  authorizeMiddleware("admin"),
  getUsersController
);

router.get("/", getSessionsController);

router.post(
  "/register",
  (req, res, next) => {
    passport.authenticate("register", (error, user, info) => {
      if (error) return next(error);

      if (!user) {
        return res.status(info?.statusCode ?? 400).json({
          status: "error",
          message: info?.message ?? "No se pudo registrar el usuario"
        });
      }

      req.user = user;
      next();
    })(req, res, next);
  },
  registerUserController
);

router.post(
  "/login",
  (req, res, next) => {
    passport.authenticate("login", (error, user, info) => {
      if (error) return next(error);

      if (!user) {
        return res.status(info?.statusCode ?? 401).json({
          status: "error",
          message: info?.message ?? "Credenciales inválidas"
        });
      }

      req.user = user;
      next();
    })(req, res, next);
  },
  loginUserController
);

router.get(
  "/current",
  passport.authenticate("current", { session: false }),
  getCurrentUserController
);

router.post("/logout", logoutUserController);

export default router;
