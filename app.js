import express from 'express';
import dotenv from 'dotenv';
import Config from './configs/config.js';
import { connectRedis } from './redis.js';
import cors from "cors";
import path from "path";
import healthRouter from "./routes/health.js";
import pastesRouter from './routes/pastes.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));


app.use("/api/health", healthRouter);
app.use("/api/pastes", pastesRouter);
app.use("/p", pastesRouter);

const startServer = async () => {
    // 1. Connect to Redis first
    await connectRedis();

    // 2. Then start Express
    app.listen(Config.PORT, (err) => {
        if (err) {
            console.log("Server Failed...");
        } else {
            console.log(`Server is running on port: ${Config.PORT}`);
        }
    });
};

startServer();