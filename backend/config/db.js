import mongoose from 'mongoose';
import { logger } from '../middleware/logger.js';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        logger.info(`MongoDB Connected: ${conn.connection.host}`, { host: conn.connection.host });
    } catch (error) {
        logger.error(`MongoDB Connection Error: ${error.message}`, { error: error.message });
        process.exit(1);
    }
};

export default connectDB;
