import {
  getSessions,
  registerUser,
  loginUser
} from "../services/sessions.service.js";
import { NODE_ENV } from "../config/env.config.js";

export const getSessionsController = async (req, res, next) => {
  try {
    const sessions = await getSessions();

    res.status(200).json({
      status: "success",
      payload: sessions
    });
  } catch (error) {
    next(error);
  }
};

export const registerUserController = async (req, res, next) => {
  try {
    const {
      first_name,
      last_name,
      email,
      password
    } = req.body;

    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Faltan campos obligatorios"
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (typeof email !== "string" || !emailRegex.test(email.trim())) {
      return res.status(400).json({
        status: "error",
        message: "El email no tiene un formato válido"
      });
    }

    if (typeof password !== "string" || password.length < 6) {
      return res.status(400).json({
        status: "error",
        message: "La contraseña debe tener al menos 6 caracteres"
      });
    }

    const user = await registerUser({
      first_name,
      last_name,
      email,
      password
    });

    res.status(201).json({
      status: "success",
      payload: user
    });
  } catch (error) {
    next(error);
  }
};

export const loginUserController = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(400).json({
        status: "error",
        message: "Faltan campos obligatorios"
      });
    }

    const { token } = await loginUser({ email, password });

    res.cookie("currentUser", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 3600000,
      secure: NODE_ENV === "production"
    });

    res.status(200).json({
      status: "success",
      message: "Login correcto"
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUserController = (req, res) => {
  const { id, email, role } = req.user;

  res.status(200).json({
    status: "success",
    payload: { id, email, role }
  });
};

export const logoutUserController = (req, res) => {
  res.clearCookie("currentUser", {
    httpOnly: true,
    sameSite: "lax",
    secure: NODE_ENV === "production"
  });

  res.status(200).json({
    status: "success",
    message: "Sesión cerrada"
  });
};
