
import {
  getEvents,
  createNewEvent,
  getEvent,
  updateExistingEvent
} from "../services/events.service.js";

export const getEventsController = async (req, res, next) => {
  try {
    const events = await getEvents();

    res.status(200).json({
      status: "success",
      payload: events
    });
  } catch (error) {
    next(error);
  }
};

export const createEventController = async (req, res, next) => {
  try {
    const {
      title,
      description,
      date,
      location,
      capacity
    } = req.body;

    const event = await createNewEvent({
      title,
      description,
      date,
      location,
      capacity,
      organizer: req.user.id,
      status: "published"
    });

    res.status(201).json({
      status: "success",
      payload: event
    });
  } catch (error) {
    next(error);
  }
};

export const updateEventController = async (req, res, next) => {
  try {
    const { id } = req.params;

    const event = await getEvent(id);

    if (!event) {
      return res.status(404).json({
        status: "error",
        message: "Evento no encontrado"
      });
    }

    const isAdmin = req.user.role === "admin";
    const isOwner = event.organizer.toString() === req.user.id;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        status: "error",
        message: "No tenés permisos para modificar este evento"
      });
    }

    const {
      title,
      description,
      date,
      location,
      capacity,
      status
    } = req.body;

    const updateData = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (date !== undefined) updateData.date = date;
    if (location !== undefined) updateData.location = location;
    if (capacity !== undefined) updateData.capacity = capacity;
    if (status !== undefined) updateData.status = status;

    const updatedEvent = await updateExistingEvent(id, updateData);

    res.status(200).json({
      status: "success",
      payload: updatedEvent
    });
  } catch (error) {
    next(error);
  }
};
