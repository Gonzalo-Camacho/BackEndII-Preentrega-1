
import Event from "../models/Event.js";

const escapeRegex = (value) => {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export const findAllEvents = async (filters = {}) => {
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

  const query = {
    status: {
      $in: status ? [status] : ["published", "finished"]
    }
  };

  if (category) {
    query.category = {
      $regex: escapeRegex(category),
      $options: "i"
    };
  }

  if (location) {
    query.location = {
      $regex: escapeRegex(location),
      $options: "i"
    };
  }

  if (dateFrom || dateTo) {
    query.date = {};

    if (dateFrom) {
      query.date.$gte = new Date(dateFrom);
    }

    if (dateTo) {
      query.date.$lte = new Date(dateTo);
    }
  }

  const allowedSortFields = [
    "date",
    "title",
    "price",
    "capacity",
    "createdAt"
  ];

  const sortField = allowedSortFields.includes(sort.replace("-", ""))
    ? sort.replace("-", "")
    : "date";

  const sortDirection = sort.startsWith("-") ? -1 : 1;

  const skip = (Number(page) - 1) * Number(limit);

  const [data, total] = await Promise.all([
    Event.find(query)
      .sort({ [sortField]: sortDirection })
      .skip(skip)
      .limit(Number(limit))
      .lean(),

    Event.countDocuments(query)
  ]);

  return {
    data,
    page: Number(page),
    limit: Number(limit),
    total,
    totalPages: Math.ceil(total / Number(limit))
  };
};

export const createEvent = async (eventData) => {
  return Event.create(eventData);
};

export const findEventById = async (eventId) => {
  return Event.findById(eventId);
};

export const updateEvent = async (eventId, updateData) => {
  return Event.findByIdAndUpdate(eventId, updateData, {
    returnDocument: "after",
    runValidators: true
  });
};
