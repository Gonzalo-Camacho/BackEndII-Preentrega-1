import {
  createTicket,
  findTicketsByUser,
  findTicketsByEvent,
  findActiveTicketByUserAndEvent,
  countOccupiedSeats,
  findTicketById,
  cancelTicket
} from "../dao/ticket.dao.js";

export const createTicketRepository = (ticketData) => {
  return createTicket(ticketData);
};

export const getTicketsByUserRepository = (userId) => {
  return findTicketsByUser(userId);
};

export const getTicketsByEventRepository = (eventId) => {
  return findTicketsByEvent(eventId);
};

export const getActiveTicketRepository = (userId, eventId) => {
  return findActiveTicketByUserAndEvent(userId, eventId);
};

export const getOccupiedSeatsRepository = (eventId) => {
  return countOccupiedSeats(eventId);
};

export const getTicketByIdRepository = (ticketId) => {
  return findTicketById(ticketId);
};

export const cancelTicketRepository = (ticketId) => {
  return cancelTicket(ticketId);
};
