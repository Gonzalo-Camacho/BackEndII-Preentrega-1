import { getAllSessions } from "../repositories/sessions.repository.js";
import {
  getUserByEmail,
  saveUser
} from "../repositories/users.repository.js";
import { hashPassword } from "../utils/hash.js";

export const getSessions = async () => {
  return getAllSessions();
};

export const registerUser = async ({
  first_name,
  last_name,
  email,
  password
}) => {
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await getUserByEmail(normalizedEmail);

  if (existingUser) {
    const error = new Error("El email ya está registrado");
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await hashPassword(password);

  const user = await saveUser({
    first_name,
    last_name,
    email: normalizedEmail,
    password: hashedPassword,
    role: "user"
  });

  return {
    id: user._id,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    role: user.role
  };
};
