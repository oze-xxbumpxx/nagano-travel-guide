import {
  createAccommodation,
  deleteAccommodation,
  getAccommodationById,
  getAllAccommodations,
  updateAccommodation,
} from "../controllers/accommodationController";
import express from "express";

const router = express.Router();

// 宿泊施設関連のルート
router.get("/", getAllAccommodations);
router.get("/:id", getAccommodationById);
router.post("/", createAccommodation);
router.put("/:id", updateAccommodation);
router.delete("/:id", deleteAccommodation);

export default router;
