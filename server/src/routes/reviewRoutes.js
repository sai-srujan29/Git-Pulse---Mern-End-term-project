import express from 'express';
import {
  analyzePR,
  getReviewHistory,
  getReviewById,
} from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/analyze', analyzePR);
router.get('/history', getReviewHistory);
router.get('/:id', getReviewById);

export default router;
