import express from "express";
import dotenv from "dotenv";

import connectDB from "./db/config.js";

const app = express();

dotenv.config();
// connect to database
connectDB();

app.listen(process.env.Port, ()=>{
    console.log(`Server is running on port ${process.env.Port}`);
})
