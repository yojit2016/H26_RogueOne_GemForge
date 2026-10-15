/**
 * Centralized typed API client for GemForge backend.
 * Talks to FastAPI endpoints via Vite proxy (/api -> http://127.0.0.1:8000).
 * Handles loading, errors, and availability gracefully without fabricating results.
 */

import type {
  AnalysisRequest,
  AnalysisResponse,
  ExitCapsule,
  HealthResponse,
  RepairRequest,
  ScanRequest,
  VerificationRequest,
  VerificationView,
} from "@/types/gemforge"

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public details?: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = endpoint.startsWith("/") ? endpoint : `/${endpoint}`
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  }

  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json"
  }

  let response: Response
  try {
    response = await fetch(url, { ...options, headers })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    throw new ApiError(
      `Cannot connect to GemForge backend at ${url}. Ensure FastAPI is running on 127.0.0.1:8000: ${errorMsg}`,
      0,
    )
  }

  if (!response.ok) {
    let errorDetail = ""
    try {
      const errJson = await response.json()
      errorDetail = errJson.detail || JSON.stringify(errJson)
    } catch {
      errorDetail = await response.text()
    }
    throw new ApiError(
      `Request failed (${response.status} ${response.statusText}): ${errorDetail || "Unknown error"}`,
      response.status,
      errorDetail,
    )
  }

  return response.json() as Promise<T>
}

export const api = {
  /**
   * Health check to detect backend liveness and current phase
   */
  async checkHealth(): Promise<HealthResponse> {
    return request<HealthResponse>("/api/health")
  },

  /**
   * Fast read-only repository scan without running code or AI
   */
  async scan(req: ScanRequest): Promise<ExitCapsule> {
    return request<ExitCapsule>("/api/scan", {
      method: "POST",
      body: JSON.stringify(req),
    })
  },

  /**
   * Full analysis with Gemma 4 migration intelligence
   */
  async analyze(req: AnalysisRequest): Promise<AnalysisResponse> {
    return request<AnalysisResponse>("/api/analyze", {
      method: "POST",
      body: JSON.stringify(req),
    })
  },

  /**
   * Run verification comparing baseline and candidate environments.
   * Requires explicit confirm_execution = true.
   */
  async verify(req: VerificationRequest): Promise<AnalysisResponse> {
    if (!req.confirm_execution) {
      throw new ApiError("Verification requires explicit user consent to execute code in isolated virtual environments.", 400)
    }
    return request<AnalysisResponse>("/api/verify", {
      method: "POST",
      body: JSON.stringify(req),
    })
  },

  /**
   * Retrieve a previously generated analysis capsule by ID
   */
  async getAnalysis(id: string): Promise<ExitCapsule> {
    return request<ExitCapsule>(`/api/analyses/${encodeURIComponent(id)}`)
  },

  /**
   * Import an existing capsule JSON without re-running verification or AI.
   * Backed by POST /analyses/import per API contract.
   */
  async importAnalysis(capsule: ExitCapsule): Promise<AnalysisResponse> {
    return request<AnalysisResponse>("/api/analyses/import", {
      method: "POST",
      body: JSON.stringify(capsule),
    })
  },

  /**
   * Retrieve detailed verification & probe observations view.
   * Backed by GET /analyses/{id}/verification per API contract.
   */
  async getVerification(id: string): Promise<VerificationView> {
    return request<VerificationView>(`/api/analyses/${encodeURIComponent(id)}/verification`)
  },

  /**
   * Request repair suggestion for an unverified migration / regression.
   * Backed by POST /repairs per API contract.
   */
  async requestRepair(req: RepairRequest): Promise<AnalysisResponse> {
    return request<AnalysisResponse>("/api/repairs", {
      method: "POST",
      body: JSON.stringify(req),
    })
  },

  /**
   * Get direct download URL for capsule export (JSON or Markdown)
   */
  getExportUrl(id: string, format: "json" | "markdown" = "json"): string {
    return `/api/analyses/${encodeURIComponent(id)}/export?format=${format}`
  },
}

