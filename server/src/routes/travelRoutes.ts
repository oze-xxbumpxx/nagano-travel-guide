import {
  getAllTravelPlans,
  getTravelPlanById,
  createTravel,
  updateTravelPlan,
  deleteTravelPlan,
} from "../controllers/travelController";
import express from "express";

const router = express.Router();

// GET /api/travel 全旅行プラン取得
router.get("/", getAllTravelPlans);

// GET /api/travel/:id 特定の旅行プラン取得
router.get("/:id", getTravelPlanById);

// POST /api/travel 旅行プラン作成
router.post("/", createTravel);

// PUT /api/travel/:id 旅行プラン更新
router.put("/:id", updateTravelPlan);

// DELETE /api/travel/:id 旅行プラン削除
router.delete("/:id", deleteTravelPlan);

export default router;
