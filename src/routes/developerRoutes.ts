import express from 'express';
import { getDeveloperAnalytics } from '../services/githubService.js';

const router = express.Router({ mergeParams: true });

router.get('/:username/analytics', getDeveloperAnalytics);

export default router;