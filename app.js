import express from 'express';
import dotenv from 'dotenv';
import Config from './configs/config.js';
import { connectRedis } from './redis.js';

dotenv.config();
const app = express();

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