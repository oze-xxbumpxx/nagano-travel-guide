import express from "express";
import {
  getAllAttractions,
  getAttractionById,
  createAttraction,
  updateAttraction,
  deleteAttraction,
} from "../controllers/attractionController";

const router = express.Router();

// 観光地関連のルート
router.get("/", getAllAttractions);
router.get("/:id", getAttractionById);
router.post("/", createAttraction);
router.put("/:id", updateAttraction);
router.delete("/:id", deleteAttraction);

export default router;
