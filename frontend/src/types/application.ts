export type ApplicationStatus =
  | "SAVED"
  | "APPLIED"
  | "INTERVIEW"
  | "TECHNICAL_TEST"
  | "OFFER"
  | "REJECTED"

export interface Application {
  id: number
  company: string
  position: string
  location: string | null
  status: ApplicationStatus
  job_url: string | null
  salary: string | null
  applied_at: string | null
  created_at: string
  updated_at: string
}