import express from 'express';
import { carData, getNews, getSessions, getStrategyRecommendation } from '../controllers/controllers.js';
import { validateStrategyRequest } from '../middleware/validation.js';
import { logger } from '../middleware/logger.js';

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "express-api",
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

router.get("/home", (req, res) => {
  logger.info("Home route accessed", { requestId: req.id });
  res.json({
    success: true,
    requestId: req.id,
    message: "Welcome to ApexData Home Route"
  });
});

router.get("/news", getNews);
router.get("/carData", carData);
router.get("/sessions", getSessions);

router.post("/strategy/recommend", validateStrategyRequest, getStrategyRecommendation);
router.post("/api/strategy/recommend", validateStrategyRequest, getStrategyRecommendation);

export default router;