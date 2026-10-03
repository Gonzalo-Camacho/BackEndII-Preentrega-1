import { getAllSessions } from "../repositories/sessions.repository.js";

export const getSessions = async () => {
  return getAllSessions();
};