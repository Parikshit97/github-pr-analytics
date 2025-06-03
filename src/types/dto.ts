import { Octokit } from "@octokit/rest";
import { Request } from "express";

// Request DTOs
export interface PRRequestParams {
  owner: string;
  repo: string;
}

// Response DTOs
export interface OpenPR {
  title: string;
  author: string | null;
  created_at: string;
  status: string;
}

export interface PRTimingMetrics {
  open_durations_ms: number[];
  average_closed_duration_ms: number;
  longest_open_pr: {
    title: string;
    author: string | null;
    created_at: string;
    duration_open_ms: number;
  } | null;
}

export interface DeveloperAnalyticsParams {
  owner: string;
  repo: string;
  username: string;
}


// Generic error response type
export interface ErrorResponse {
  message: string;
}

// Union types for responses allowing either success or error
export type OpenPRResponse = OpenPR[] | ErrorResponse;
export type PRTimingMetricsResponse = PRTimingMetrics | ErrorResponse;

export interface AuthenticatedRequest<P = any> extends Request<P> {
  octokit?: Octokit;
  user?: { accessToken?: string };
}

export interface DeveloperAnalyticsResponse {
  total_prs: number;
  success_rate: string;
  avg_merge_time_ms: number;
}

