import "dotenv/config";
import connectDB from "./db/index.js";
import { app } from "./app.js";

/*
const app = express();


(async () => {
    try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        app.on("error", (error) => {
            console.error(error);
            throw error;

            app.listen(process.env.PORT, () => {
                console.log(`App is listening in PORT ${process.env.PORT}`)
            })



        })
    } catch (error) {
        console.error("Error: ", error)
        throw error;
    }
})()

*/

await connectDB()
  .then(() => {
    app.on("error", (err) => {
      console.error("MongoDB connection FAILED", err);
    });
    app.listen(process.env.PORT || 8000, () => {
      `Server is running on http://localhost:${process.env.PORT}`;
    });
  })
  .catch((err) => {
    console.log("MongoDB connection FAILED", err);
  });
