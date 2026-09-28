import { getAllEvents } from "../repositories/event.repository.js";

export const getEvents = async () => {
  return getAllEvents();
};