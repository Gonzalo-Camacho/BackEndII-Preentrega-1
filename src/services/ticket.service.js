import mongoose from "mongoose";
import { randomUUID } from "node:crypto";

import {
  createTicketRepository,
  getTicketsByUserRepository,
  getTicketsByEventRepository,
  getActiveTicketRepository,
  getTicketByIdRepository,
  cancelTicketRepository
} from "../repositories/ticket.repository.js";

import { getEventById, reserveSeatsRepository, releaseSeatsRepository } from "../repositories/event.repository.js";
import { getUserById } from "../repositories/users.repository.js";
import { sendTicketConfirmation } from "./email.service.js";

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const validateObjectId = (id, label) => {
  if (!mongoose.isValidObjectId(id)) {
    throw createError(`${label} no válido`, 400);
  }
};

export const createEventTicket = async (
  eventId,
  userId,
  quantity,
  sendConfirmation = sendTicketConfirmation
) => {
  validateObjectId(eventId, "ID del evento");
  validateObjectId(userId, "ID del usuario");

  const parsedQuantity = Number(quantity);

  if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
    throw createError("La cantidad debe ser un entero mayor a 0");
  }

  const event = await getEventById(eventId);

  if (!event) {
    throw createError("Evento no encontrado", 404);
  }

  if (event.status !== "published") {
    throw createError("El evento no está disponible para inscripciones");
  }

  if (new Date(event.date) <= new Date()) {
    throw createError("No es posible inscribirse a un evento finalizado");
  }

  const existingTicket = await getActiveTicketRepository(userId, eventId);

  if (existingTicket) {
    throw createError("Ya tenés una inscripción activa para este evento", 409);
  }

  const user = await getUserById(userId);

  if (!user) {
    throw createError("Usuario no encontrado", 404);
  }

  const reservedEvent = await reserveSeatsRepository(
    eventId,
    parsedQuantity
  );

  if (!reservedEvent) {
    throw createError("No hay suficientes cupos disponibles o el evento ya no admite inscripciones", 409);
  }

  const reservationCode = randomUUID();

  let ticket;

  try {
    ticket = await createTicketRepository({
      user: userId,
      event: eventId,
      quantity: parsedQuantity,
      status: "confirmed",
      reservationCode
    });
  } catch (error) {
    await releaseSeatsRepository(eventId, parsedQuantity);

    if (error.code === 11000) {
      throw createError(
        "Ya tenés una inscripción activa para este evento",
        409
      );
    }

    throw error;
  }

  let emailSent = true;

  try {
    await sendConfirmation({
      email: user.email,
      firstName: user.first_name,
      event: reservedEvent,
      quantity: parsedQuantity,
      reservationCode
    });
  } catch (error) {
    emailSent = false;
  }

  return {
    ticket,
    emailSent
  };
};

export const getMyTickets = async (userId) => {
  validateObjectId(userId, "ID del usuario");

  return getTicketsByUserRepository(userId);
};

export const getEventTickets = async (eventId, user) => {
  validateObjectId(eventId, "ID del evento");

  const event = await getEventById(eventId);

  if (!event) {
    throw createError("Evento no encontrado", 404);
  }

  const isAdmin = user.role === "admin";
  const isOwner =
    user.role === "organizer" &&
    event.organizer.toString() === user.id;

  if (!isAdmin && !isOwner) {
    throw createError(
      "No tenés permisos para consultar los tickets de este evento",
      403
    );
  }

  return getTicketsByEventRepository(eventId);
};

export const cancelUserTicket = async (ticketId, user) => {
  validateObjectId(ticketId, "ID del ticket");

  const ticket = await getTicketByIdRepository(ticketId);

  if (!ticket) {
    throw createError("Ticket no encontrado", 404);
  }

  const isAdmin = user.role === "admin";
  const isOwner = ticket.user.toString() === user.id;

  if (!isAdmin && !isOwner) {
    throw createError("No tenés permisos para cancelar este ticket", 403);
  }

  if (ticket.status === "cancelled") {
    throw createError("El ticket ya está cancelado", 409);
  }

  const cancelledTicket = await cancelTicketRepository(ticketId);

  if (!cancelledTicket) {
    throw createError("El ticket ya fue cancelado", 409);
  }

  const releasedEvent = await releaseSeatsRepository(
    ticket.event._id,
    ticket.quantity
  );

  if (!releasedEvent) {
    throw createError(
      "El ticket fue cancelado, pero no se pudieron liberar los cupos",
      500
    );
  }

  return cancelledTicket;
};
