
interface LoginResponse {
  access_token: string
  token_type: string
}

export async function login(
  email: string,
  password: string
) {
  const formData = new URLSearchParams()

  formData.append("username", email)
  formData.append("password", password)

  const response = await fetch(
  "/api/auth/login",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData,
  }
)

  if (!response.ok) {
    let message = "Email ou mot de passe incorrect."

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

  const data: LoginResponse =
    await response.json()

  localStorage.setItem(
    "access_token",
    data.access_token
  )

  return data
}


export function logout() {
  localStorage.removeItem("access_token")
}


export function isAuthenticated() {
  return Boolean(
    localStorage.getItem("access_token")
  )
}