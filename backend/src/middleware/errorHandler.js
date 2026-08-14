export function notFoundHandler(_request, response) {
  response.status(404).json({
    ok: false,
    message: "Route not found",
  });
}

export function errorHandler(error, _request, response, _next) {
  const statusCode = error.statusCode || 500;

  response.status(statusCode).json({
    ok: false,
    message: error.message || "Something went wrong",
  });
}
