export function envoyerSucces(req, res, statusCode, message, data) {
  return res.status(statusCode).json({
    success: true,
    statusCode,
    message,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
    data
  });
}
