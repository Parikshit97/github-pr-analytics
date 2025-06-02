// routes/prRoutes.ts

import express from 'express';
import type { Request, Response } from 'express';
import { PRController } from '../controllers/PRController.js'; // Update the path as needed
import { PRRequestParams } from 'types/dto.js';

const router = express.Router({ mergeParams: true });

/**
 * @openapi
 * /repos/{owner}/{repo}/prs/open:
 *   get:
 *     summary: Get open PRs
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
 *     responses:
 *       200:
 *         description: List of open PRs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                   author:
 *                     type: string
 *                   created_at:
 *                     type: string
 *                   status:
 *                     type: string
 */
router.get('/open', (req, res) : any =>
    PRController.getOpenPRs(req as Request<PRRequestParams>, res)
  );
  
/**
 * @openapi
 * /repos/{owner}/{repo}/prs/timing:
 *   get:
 *     summary: Get PR timing metrics
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
 *     responses:
 *       200:
 *         description: PR timing metrics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 open_durations_ms:
 *                   type: array
 *                   items:
 *                     type: number
 *                 average_closed_duration_ms:
 *                   type: number
 *                 longest_open_pr:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                     author:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                     duration_open_ms:
 *                       type: number
 */
router.get('/timing', (req, res) : any => 
    PRController.getPRTimingMetrics(req as Request<PRRequestParams>, res)
  );
  
  

export default router;
