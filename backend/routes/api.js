import express from "express";
import { checkHealth, getSchedule, getTeams } from "../controllers/apiControllers.js";

const router = express.Router();

router.get("/health", checkHealth);
router.get("/schedule", getSchedule);
router.get("/teams", getTeams);

export default router;