export interface ApplicationStats {
  total: number

  by_status: {
    SAVED: number
    APPLIED: number
    INTERVIEW: number
    TECHNICAL_TEST: number
    OFFER: number
    REJECTED: number
  }
}