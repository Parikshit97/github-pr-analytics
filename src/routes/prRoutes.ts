import express from 'express';
import { getOpenPRs, getPRTimingMetrics } from '../services/githubService.js';

const router = express.Router({ mergeParams: true });

router.get('/open', getOpenPRs);
router.get('/timing', getPRTimingMetrics);

export default router;