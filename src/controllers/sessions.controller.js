import { getSessions } from "../services/sessions.service.js";

export const getSessionsController = async (req, res, next) => {
  try {
    const sessions = await getSessions();

    res.status(200).json({
      status: "success",
      payload: sessions
    });
  } catch (error) {
    next(error);
  }
};
