
export const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || 500;
  let message = err.message || "Error interno del servidor";

  if (err.name === "CastError") {
    status = 400;
    message = "El identificador proporcionado no es válido";
  }

  if (err.name === "ValidationError") {
    status = 400;
    message = err.message;
  }

  if (err.code === 11000) {
    status = 409;
    message = "Ya existe un registro con esos datos";
  }

  res.status(status).json({
    status: "error",
    message
  });
};
