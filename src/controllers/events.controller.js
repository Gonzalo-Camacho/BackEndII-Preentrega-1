
import {
  getEvents,
  createNewEvent,
  getEvent,
  updateExistingEvent,
  changeEventStatus
} from "../services/events.service.js";

export const getEventsController = async (req, res, next) => {
  try {
    const events = await getEvents(req.query);

    res.status(200).json({
      status: "success",
      data: events.data,
      payload: events.data,
      page: events.page,
      limit: events.limit,
      total: events.total,
      totalPages: events.totalPages
    });
  } catch (error) {
    next(error);
  }
};

export const getEventController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await getEvent(id);

    if (!event || !["published", "finished"].includes(event.status)) {
      return res.status(404).json({
        status: "error",
        message: "Evento no encontrado"
      });
    }

    res.status(200).json({
      status: "success",
      payload: event
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
      category,
      date,
      location,
      capacity,
      price,
      status
    } = req.body;

    const event = await createNewEvent({
      title,
      description,
      category,
      date,
      location,
      capacity,
      price,
      status,
      organizer: req.user.id
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
      category,
      date,
      location,
      capacity,
      price
    } = req.body;

    const updateData = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (date !== undefined) updateData.date = date;
    if (location !== undefined) updateData.location = location;
    if (capacity !== undefined) updateData.capacity = capacity;
    if (price !== undefined) updateData.price = price;

    const updatedEvent = await updateExistingEvent(id, updateData);

    res.status(200).json({
      status: "success",
      payload: updatedEvent
    });
  } catch (error) {
    next(error);
  }
};

export const changeEventStatusController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

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

    const updatedEvent = await changeEventStatus(id, status);

    res.status(200).json({
      status: "success",
      payload: updatedEvent
    });
  } catch (error) {
    next(error);
  }
};