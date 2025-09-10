import express from 'express';
import {
  createTravelPlan,
  getTravelPlans,
  getTravelPlanById,
  updateTravelPlan,
  deleteTravelPlan,
  addItineraryItem,
  updateItineraryItem,
  deleteItineraryItem
} from '../controllers/travelController';

const router = express.Router();

// 旅行プランのCRUD操作
router.route('/')
  .get(getTravelPlans)
  .post(createTravelPlan);

router.route('/:id')
  .get(getTravelPlanById)
  .put(updateTravelPlan)
  .delete(deleteTravelPlan);

// 旅程の操作
router.route('/:id/itinerary')
  .post(addItineraryItem);

router.route('/:id/itinerary/:itemId')
  .put(updateItineraryItem)
  .delete(deleteItineraryItem);

export default router;
