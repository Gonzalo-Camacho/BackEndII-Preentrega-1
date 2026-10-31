
import {
  getAllEvents,
  saveEvent,
  getEventById,
  editEvent
} from "../repositories/event.repository.js";

const createValidationError = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

export const getEvents = async (filters = {}) => {
  const {
    status,
    category,
    location,
    dateFrom,
    dateTo,
    page = 1,
    limit = 10,
    sort = "date"
  } = filters;

  if (status && !["published", "finished"].includes(status)) {
    throw createValidationError(
      "El estado solicitado no está disponible en el listado público"
    );
  }

  const parsedPage = Number(page);
  const parsedLimit = Number(limit);

  if (!Number.isInteger(parsedPage) || parsedPage < 1) {
    throw createValidationError("La página debe ser un entero mayor a 0");
  }

  if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
    throw createValidationError("El límite debe estar entre 1 y 100");
  }

  if (dateFrom && Number.isNaN(new Date(dateFrom).getTime())) {
    throw createValidationError("La fecha inicial no es válida");
  }

  if (dateTo && Number.isNaN(new Date(dateTo).getTime())) {
    throw createValidationError("La fecha final no es válida");
  }

  if (dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo)) {
    throw createValidationError(
      "La fecha inicial no puede ser posterior a la fecha final"
    );
  }

  const allowedSortFields = [
    "date",
    "-date",
    "title",
    "-title",
    "price",
    "-price",
    "capacity",
    "-capacity",
    "createdAt",
    "-createdAt"
  ];

  if (!allowedSortFields.includes(sort)) {
    throw createValidationError("El criterio de ordenamiento no es válido");
  }

  return getAllEvents({
    status,
    category,
    location,
    dateFrom,
    dateTo,
    page: parsedPage,
    limit: parsedLimit,
    sort
  });
};

export const createNewEvent = async (eventData) => {
  const { date, capacity, price, status } = eventData;

  if (!date || Number.isNaN(new Date(date).getTime())) {
    throw createValidationError("La fecha del evento no es válida");
  }

  if (new Date(date) <= new Date()) {
    throw createValidationError("No se puede crear un evento con fecha pasada");
  }

  if (!Number.isInteger(Number(capacity)) || Number(capacity) <= 0) {
    throw createValidationError(
      "La capacidad debe ser un número entero mayor a 0"
    );
  }

  if (price === undefined || price === null || price === "") {
    throw createValidationError("El precio es obligatorio");
  }

  if (!Number.isFinite(Number(price)) || Number(price) < 0) {
    throw createValidationError(
      "El precio debe ser un número mayor o igual a 0"
    );
  }

  if (status !== undefined && !["draft", "published"].includes(status)) {
    throw createValidationError(
      "Al crear un evento, el estado solo puede ser draft o published"
    );
  }

  return saveEvent({
    ...eventData,
    date: new Date(date),
    capacity: Number(capacity),
    price: Number(price),
    status: status ?? "draft"
  });
};

export const getEvent = async (eventId) => {
  return getEventById(eventId);
};

export const updateExistingEvent = async (eventId, updateData) => {
  const event = await getEventById(eventId);

  if (!event) {
    const error = new Error("Evento no encontrado");
    error.statusCode = 404;
    throw error;
  }

  if (event.status === "cancelled") {
    throw createValidationError(
      "No se puede modificar un evento cancelado"
    );
  }

  if (updateData.status !== undefined) {
    throw createValidationError(
      "El estado debe modificarse mediante el endpoint específico"
    );
  }

  if (updateData.date !== undefined) {
    const newDate = new Date(updateData.date);

    if (Number.isNaN(newDate.getTime())) {
      throw createValidationError("La fecha del evento no es válida");
    }

    if (newDate <= new Date()) {
      throw createValidationError("No se puede asignar una fecha pasada");
    }

    updateData.date = newDate;
  }

  if (updateData.capacity !== undefined) {
    if (
      !Number.isInteger(Number(updateData.capacity)) ||
      Number(updateData.capacity) <= 0
    ) {
      throw createValidationError(
        "La capacidad debe ser un número entero mayor a 0"
      );
    }

    updateData.capacity = Number(updateData.capacity);
  }

  if (updateData.price !== undefined) {
    if (
      updateData.price === null ||
      updateData.price === "" ||
      !Number.isFinite(Number(updateData.price)) ||
      Number(updateData.price) < 0
    ) {
      throw createValidationError(
        "El precio debe ser un número mayor o igual a 0"
      );
    }

    updateData.price = Number(updateData.price);
  }

  return editEvent(eventId, updateData);
};

export const changeEventStatus = async (eventId, newStatus) => {
  const event = await getEventById(eventId);

  if (!event) {
    const error = new Error("Evento no encontrado");
    error.statusCode = 404;
    throw error;
  }

  if (event.status === "cancelled") {
    throw createValidationError(
      "No se puede modificar el estado de un evento cancelado"
    );
  }

  const allowedStatuses = ["draft", "published", "cancelled", "finished"];

  if (!allowedStatuses.includes(newStatus)) {
    throw createValidationError("El estado del evento no es válido");
  }

  if (
    newStatus === "published" &&
    ["finished", "cancelled"].includes(event.status)
  ) {
    throw createValidationError(
      "No se puede publicar un evento finalizado o cancelado"
    );
  }

  return editEvent(eventId, { status: newStatus });
};
