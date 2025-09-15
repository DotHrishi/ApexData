import express from "express";
import {
  checkHealth,
  getSchedule,
  analyzeData,
  techGuides,
} from "../controllers/apiControllers.js";

const router = express.Router();

router.get("/health", checkHealth);
router.get("/schedule", getSchedule);
router.get("/analyze", analyzeData);
router.get("/technical_guides", techGuides);

export default router;
