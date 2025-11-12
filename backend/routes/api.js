import express from "express";
import {
  checkHealth,
  getSchedule,
  nextRace,
} from "../controllers/apiControllers.js";

const router = express.Router();

router.get("/health", checkHealth);
router.get("/schedule", getSchedule);
router.get("/next-race", nextRace);

export default router;
