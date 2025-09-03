import express from "express";
import { checkHealth } from "../controllers/apiControllers.js";

const router = express.Router();

router.get("/health", checkHealth);

export default router;