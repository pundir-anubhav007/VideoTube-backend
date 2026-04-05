import morgan from "morgan";
import logger from "../logger.js";


const format = ":method :url :status :res[content-length]b - :response-time ms";
//  "GET /api/users 200 452b - 12ms"

const stream = {
  write: (message) => logger.http(message.trim()),
};

// can be used for skipping logs to certain routes
// const skip = (req, res) => {

//   if (req.originalUrl === "/health") {
//     return true;
//   }

// };

const morganMiddleware = morgan(format, { stream });

export default morganMiddleware;
