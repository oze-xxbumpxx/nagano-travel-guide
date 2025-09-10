import express from 'express';
import {
  createAccommodation,
  getAccommodations,
  getAccommodationById,
  updateAccommodation,
  deleteAccommodation,
  getAccommodationsByType,
  getRecommendedAccommodations,
  addReview
} from '../controllers/accommodationController';

const router = express.Router();

// 宿泊施設のCRUD操作
router.route('/')
  .get(getAccommodations)
  .post(createAccommodation);

router.route('/recommended')
  .get(getRecommendedAccommodations);

router.route('/type/:type')
  .get(getAccommodationsByType);

router.route('/:id')
  .get(getAccommodationById)
  .put(updateAccommodation)
  .delete(deleteAccommodation);

router.route('/:id/reviews')
  .post(addReview);

export default router;
