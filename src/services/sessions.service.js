
import { getAllSessions } from "../repositories/sessions.repository.js";
import {
  getAllUsers
} from "../repositories/users.repository.js";

export const getSessions = async () => {
  return getAllSessions();
};

export const getUsers = async () => {
  return getAllUsers();
};
