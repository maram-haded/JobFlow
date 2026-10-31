import { apiFetch } from "./api"
import type { ApplicationStats } from "../types/statistics"

export async function getApplicationStats(): Promise<ApplicationStats> {
  return apiFetch("/applications/stats")
}