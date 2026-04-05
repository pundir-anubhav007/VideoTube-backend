import logger from "../logger.js";
import { ApiError } from "../utils/ApiError.js";

export const errorHandler = (err, req, res, next) => {
  // Handled Error
  if (err instanceof ApiError) {
    logger.warn(
      `[API ERROR] ${err.statusCode} - ${err.message} - ${req.originalUrl}`
    );

    return res.status(err.statusCode).json({
      success: err.success,
      message: err.message,
      errors: err.errors,
      data: err.data,
    });
  }

  // Unhandled Error
  logger.error(
    `[UNHANDLED ERROR] 500 - ${err.message} - ${req.originalUrl}\nStack: ${err.stack}`
  );


  const isDevelopment = process.env.NODE_ENV === "development";

  return res.status(500).json({
    success: false,
    message: isDevelopment ? err.message : "Internal Server Error",
    errors: [],
    stack: isDevelopment ? err.stack : undefined,
  });
};
