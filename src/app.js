import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

/*
const corsOptions = {
  origin: function (origin, callback) {
    const whitelistedOrigins = ['http://localhost:5173'];
    if (whitelistedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS "));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 204,

};
*/

//must have
// app.options('*', cors(corsOptions))  -> This line responds to the options sent by the browser during preflight

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// routes import
import userRouter from "./routes/user.routes.js";
import videoRoutes from "./routes/video.routes.js";



//routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRoutes);

export { app };
