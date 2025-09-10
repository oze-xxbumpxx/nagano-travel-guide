import express from 'express';
import {
  createAttraction,
  getAttractions,
  getAttractionById,
  updateAttraction,
  deleteAttraction,
  getAttractionsByCategory,
  getRecommendedAttractions,
  addReview
} from '../controllers/attractionController';

const router = express.Router();

// 観光地のCRUD操作
router.route('/')
  .get(getAttractions)
  .post(createAttraction);

router.route('/recommended')
  .get(getRecommendedAttractions);

router.route('/category/:category')
  .get(getAttractionsByCategory);

router.route('/:id')
  .get(getAttractionById)
  .put(updateAttraction)
  .delete(deleteAttraction);

router.route('/:id/reviews')
  .post(addReview);

export default router;
