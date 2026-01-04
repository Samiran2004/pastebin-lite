import dotenv from 'dotenv';

dotenv.config();

const Config = {
    PORT: process.env.PORT,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    REDIS_USERNAME: process.env.REDIS_USERNAME
}

export default Config;