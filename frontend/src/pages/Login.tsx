import { useState } from "react"
import { login } from "../services/auth"

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    setError("")
    setLoading(true)

    try {
    await login(email, password)

window.location.reload()
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">
            JobFlow
          </h1>

          <p className="mt-2 text-slate-500">
            Manage your job applications
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="maram@jobflow.com"
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="••••••••"
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-slate-900 px-4 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Connexion..."
              : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login