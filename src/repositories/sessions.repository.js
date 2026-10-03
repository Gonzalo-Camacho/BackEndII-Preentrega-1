import { findAllSessions } from "../dao/sessions.dao.js";

export const getAllSessions = async () => {
  return findAllSessions();
};