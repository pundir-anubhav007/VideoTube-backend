import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/golbarError.middleware.js";


const app = express();


const corsOptions = {
  origin: function (origin, callback) {
    const whitelistedOrigins = ['http://localhost:5500'];
    if (whitelistedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS "));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization","Cookie"],
  exposedHeaders: ["Authorization"],
  credentials: true,
};


app.use(cors(corsOptions));
//must have
 app.options(/.*/, cors(corsOptions)); // -> This line responds to the options sent by the browser during preflight



app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// routes import
import userRouter from "./routes/user.routes.js";
import videoRoutes from "./routes/video.routes.js";
import playlistRoutes from "./routes/playlist.routes.js";



//routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRoutes);
app.use("/api/v1/playlists", playlistRoutes);

app.use(errorHandler);
export { app };
