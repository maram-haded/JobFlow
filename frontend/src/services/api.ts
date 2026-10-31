const API_URL = "/api"

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = localStorage.getItem("access_token")

  const headers = new Headers(options.headers)

  headers.set("Content-Type", "application/json")

  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`
    )
  }

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  )

  if (!response.ok) {
    let message = "Une erreur est survenue."

    try {
      const data = await response.json()

      if (data.detail) {
        message = data.detail
      }
    } catch {
      // Ignore JSON parsing errors
    }

    throw new Error(message)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}