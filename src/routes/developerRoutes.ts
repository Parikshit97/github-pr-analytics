import { DeveloperAnalyticsParams } from '../types/dto.js';
import { PRController } from '../controllers/PRController.js';
import express from 'express';

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
// Instead of passing the method reference directly,
// use an arrow function wrapper to handle typing properly.

router.get('/:username/analytics', (req, res, next) : any => {
    const params = req.params as unknown as DeveloperAnalyticsParams;

    const accessToken = (req.user as any)?.accessToken;

    if (!accessToken) {
        return res.status(401).json({ message: "Access token not found" });
    }
  
    const typedReq = Object.assign(req, { params });
  
    PRController.getDeveloperAnalytics(typedReq, res).catch(next);
  });
  
export default router;