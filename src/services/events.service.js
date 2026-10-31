
import {
  getAllEvents,
  saveEvent,
  getEventById,
  editEvent
} from "../repositories/event.repository.js";

export const getEvents = async () => {
  return getAllEvents();
};

export const createNewEvent = async (eventData) => {
  return saveEvent(eventData);
};

export const getEvent = async (eventId) => {
  return getEventById(eventId);
};

export const updateExistingEvent = async (eventId, updateData) => {
  return editEvent(eventId, updateData);
};
