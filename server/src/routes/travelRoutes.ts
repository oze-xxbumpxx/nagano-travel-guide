import { createTravel } from "../controllers/travelController";
import express from "express";

const router = express.Router();

// POST /api/travel 旅行プラン作成
router.post("/", createTravel);

export default router;
