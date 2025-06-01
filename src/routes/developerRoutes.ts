import express from 'express';
import { getDeveloperAnalytics } from '../services/githubService.js';

const router = express.Router({ mergeParams: true });

/**
 * @openapi
 * /repos/{owner}/{repo}/dev/{username}/analytics:
 *   get:
 *     summary: Get analytics for a developer's pull requests
 *     parameters:
 *       - in: path
 *         name: owner
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: repo
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Developer PR analytics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total_prs:
 *                   type: integer
 *                 success_rate:
 *                   type: string
 *                 avg_merge_time_ms:
 *                   type: number
 */
router.get('/:username/analytics', getDeveloperAnalytics);


export default router;