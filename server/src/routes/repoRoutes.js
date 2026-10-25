import express from 'express';
import {
  getRepositories,
  getPullRequests,
  getSinglePullRequest,
} from '../controllers/repoController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getRepositories);
router.get('/:owner/:repo/pulls', getPullRequests);
router.get('/:owner/:repo/pulls/:pullNumber', getSinglePullRequest);

export default router;
