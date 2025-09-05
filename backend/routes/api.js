import express from "express";
import { checkHealth, getSchedule } from "../controllers/apiControllers.js";

const router = express.Router();

router.get("/health", checkHealth);
router.get("/schedule", getSchedule);

export default router;