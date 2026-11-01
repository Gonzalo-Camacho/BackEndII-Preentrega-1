import Ticket from "../models/Ticket.js";

export const createTicket = (ticketData) => {
  return Ticket.create(ticketData);
};

export const findTicketsByUser = (userId) => {
  return Ticket.find({ user: userId })
    .populate("event", "title date location")
    .sort({ createdAt: -1 });
};

export const findTicketsByEvent = (eventId) => {
  return Ticket.find({ event: eventId })
    .populate("user", "first_name last_name email")
    .sort({ createdAt: -1 });
};

export const findActiveTicketByUserAndEvent = (userId, eventId) => {
  return Ticket.findOne({
    user: userId,
    event: eventId,
    status: { $in: ["confirmed", "pending"] }
  });
};

export const countOccupiedSeats = async (eventId) => {
  const result = await Ticket.aggregate([
    {
      $match: {
        event: eventId,
        status: { $in: ["confirmed", "pending"] }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$quantity" }
      }
    }
  ]);

  return result[0]?.total || 0;
};

export const findTicketById = (ticketId) => {
  return Ticket.findById(ticketId).populate("event", "title date location");
};

export const cancelTicket = (ticketId) => {
  return Ticket.findOneAndUpdate(
    {
      _id: ticketId,
      status: { $in: ["confirmed", "pending"] }
    },
    {
      status: "cancelled",
      cancelledAt: new Date()
    },
    {
      returnDocument: "after",
      runValidators: true
    }
  );
};
