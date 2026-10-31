import { apiFetch } from "./api"
import type {
  Application,
  ApplicationStatus,
} from "../types/application"


export interface CreateApplicationData {
  company: string
  position: string
  location: string | null
  status: ApplicationStatus
  job_url: string | null
  salary: string | null
  applied_at: string | null
}



export async function getApplications(
  search = "",
  statusFilter = ""
): Promise<Application[]> {
  const params = new URLSearchParams()

  if (search.trim()) {
    params.set("search", search.trim())
  }

  if (statusFilter) {
    params.set("status_filter", statusFilter)
  }

  const query = params.toString()

  return apiFetch(`/applications/${query ? `?${query}` : ""}`)
}


export async function createApplication(
  application: CreateApplicationData
): Promise<Application> {
  return apiFetch("/applications/", {
    method: "POST",
    body: JSON.stringify(application),
  })
}

export async function updateApplication(
  applicationId: number,
  application: Partial<CreateApplicationData>
): Promise<Application> {
  return apiFetch(`/applications/${applicationId}`, {
    method: "PUT",
    body: JSON.stringify(application),
  })
}


export async function deleteApplication(
  applicationId: number
): Promise<void> {
  await apiFetch(`/applications/${applicationId}`, {
    method: "DELETE",
  })
}