import {
  getSessions,
  registerUser
} from "../services/sessions.service.js";

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

    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        status: "error",
        message: "El email no tiene un formato válido"
      });
    }

    if (password.length < 6) {
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
