import { createClient } from 'redis';
import Config from './configs/config.js';

const client = createClient({
    password: Config.REDIS_PASSWORD,
    socket: {
        host: Config.REDIS_HOST,
        port: Config.REDIS_PORT,
        connectTimeout: 10000
    }
});

const connectRedis = async () => {
    try {
        console.log("Redis starting...");
        client.on('error', err => console.log('Redis Client Error', err));
        await client.connect();
        console.log("Redis Connected Successfully!");
    } catch (err) {
        console.error("Failed to connect to Redis:", err);
        process.exit(1);
    }
}

export { connectRedis, client };