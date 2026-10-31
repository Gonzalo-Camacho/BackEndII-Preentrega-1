
import { getSessions, getUsers } from "../services/sessions.service.js";
import { generateToken } from "../utils/jwt.js";
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

export const registerUserController = (req, res) => {
  res.status(201).json({
    status: "success",
    payload: req.user
  });
};

export const loginUserController = (req, res) => {
  const user = req.user;
  const token = generateToken(user);

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

export const getUsersController = async (req, res, next) => {
  try {
    const users = await getUsers();

    res.status(200).json({
      status: "success",
      payload: users
    });
  } catch (error) {
    next(error);
  }
};
