export const notFoundHandler = (req, res, next) => {
  const error = new Error(
    `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  );

  error.status = 404;

  next(error);
};