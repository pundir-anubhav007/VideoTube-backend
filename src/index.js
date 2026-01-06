import "dotenv/config"
import express from 'express'
import connectDB from "./db/index.js";



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

connectDB();