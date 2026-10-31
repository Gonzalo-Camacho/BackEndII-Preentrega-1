
import Event from "../models/Event.js";

export const findAllEvents = async () => {
  return Event.find({ status: "published" }).lean();
};

export const createEvent = async (eventData) => {
  return Event.create(eventData);
};

export const findEventById = async (eventId) => {
  return Event.findById(eventId);
};

export const updateEvent = async (eventId, updateData) => {
  return Event.findByIdAndUpdate(
    eventId,
    updateData,
    {
      returnDocument: "after",
      runValidators: true
    }
  );
};
