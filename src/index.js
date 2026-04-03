import "dotenv/config";
import connectDB from "./db/index.js";
import { app } from "./app.js";


const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    //  Connect to DB
    await connectDB();

    //  Start server ONLY after DB is ready
    const server = app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

    //  Listen for SERVER-LEVEL runtime errors
    server.on("error", (err) => {
      console.error("Server runtime error:", err);
      process.exit(1);
    });
  } catch (error) {
    //  Startup failure 
    console.error("Startup failed:", error);
    process.exit(1);
  }
};

startServer();


