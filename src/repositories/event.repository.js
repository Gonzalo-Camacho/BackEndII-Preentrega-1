import { findAllEvents } from "../dao/event.dao.js";

export const getAllEvents = async () => {
  return findAllEvents();
};