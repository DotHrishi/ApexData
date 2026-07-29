import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import router from './routes/routes.js';
import connectDB from './config/db.js';
import { correlationIdMiddleware } from './middleware/correlationId.js';
import { requestLoggerMiddleware, logger } from './middleware/logger.js';
import { globalErrorHandler } from './middleware/errorHandler.js';

const app = express();

// Connect to Database
connectDB();

const PORT = process.env.PORT || 5000;

// CORS: read allowed origins from env, fallback to open in development
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : true; // true = allow all origins (used in local development)

app.use(correlationIdMiddleware);
app.use(requestLoggerMiddleware);
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

app.use("/", router);

app.get("/", (req, res) => {
    res.json({
        success: true,
        requestId: req.id,
        message: "ApexData Backend is running"
    });
});

// Centralized Global Error Handler
app.use(globalErrorHandler);

app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`, { port: PORT });
});