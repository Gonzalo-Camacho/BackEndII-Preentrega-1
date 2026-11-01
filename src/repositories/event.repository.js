import {
  findAllEvents,
  createEvent,
  findEventById,
  updateEvent,
  reserveEventSeats,
  releaseEventSeats
} from "../dao/event.dao.js";

export const getAllEvents = async (filters = {}) => {
  return findAllEvents(filters);
};

export const saveEvent = async (eventData) => {
  return createEvent(eventData);
};

export const getEventById = async (eventId) => {
  return findEventById(eventId);
};

export const editEvent = async (eventId, updateData) => {
  return updateEvent(eventId, updateData);
};

export const reserveSeatsRepository = async (eventId, quantity) => {
  return reserveEventSeats(eventId, quantity);
};

export const releaseSeatsRepository = async (eventId, quantity) => {
  return releaseEventSeats(eventId, quantity);
};