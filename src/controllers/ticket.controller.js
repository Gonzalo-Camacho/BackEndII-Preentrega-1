import {
  createEventTicket,
  getMyTickets,
  getEventTickets,
  cancelUserTicket
} from "../services/ticket.service.js";

export const createTicketController = async (req, res, next) => {
  try {
    const { eid } = req.params;
    const { quantity } = req.body;

    const result = await createEventTicket(
      eid,
      req.user.id,
      quantity
    );

    res.status(201).json({
      status: "success",
      message: result.emailSent
        ? "Inscripción confirmada. Se envió el correo de confirmación."
        : "Inscripción confirmada, pero no se pudo enviar el correo.",
      payload: result.ticket
    });
  } catch (error) {
    next(error);
  }
};

export const getMyTicketsController = async (req, res, next) => {
  try {
    const tickets = await getMyTickets(req.user.id);

    res.status(200).json({
      status: "success",
      payload: tickets
    });
  } catch (error) {
    next(error);
  }
};

export const getEventTicketsController = async (req, res, next) => {
  try {
    const { eid } = req.params;
    const tickets = await getEventTickets(eid, req.user);

    res.status(200).json({
      status: "success",
      payload: tickets
    });
  } catch (error) {
    next(error);
  }
};

export const cancelTicketController = async (req, res, next) => {
  try {
    const { tid } = req.params;
    const ticket = await cancelUserTicket(tid, req.user);

    res.status(200).json({
      status: "success",
      message: "Inscripción cancelada correctamente",
      payload: ticket
    });
  } catch (error) {
    next(error);
  }
};
