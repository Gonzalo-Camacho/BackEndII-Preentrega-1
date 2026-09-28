import { getEvents } from "../services/events.service.js";

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