import { useCallback, useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"

import AddApplicationForm from "../components/AddApplicationForm"
import EditApplicationForm from "../components/EditApplicationForm"
import StatisticsCharts from "../components/StatisticsCharts"

import { getApplications, deleteApplication } from "../services/applications"
import { getApplicationStats } from "../services/statistics"
import { logout } from "../services/auth"

import type { Application, ApplicationStatus } from "../types/application"
import type { ApplicationStats } from "../types/statistics"

const STATUS_OPTIONS: ApplicationStatus[] = [
  "SAVED",
  "APPLIED",
  "INTERVIEW",
  "TECHNICAL_TEST",
  "OFFER",
  "REJECTED",
]

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  SAVED: "Saved",
  APPLIED: "Applied",
  INTERVIEW: "Interview",
  TECHNICAL_TEST: "Technical test",
  OFFER: "Offer",
  REJECTED: "Rejected",
}

const STATUS_BADGE: Record<ApplicationStatus, string> = {
  SAVED: "bg-slate-100 text-slate-700",
  APPLIED: "bg-blue-100 text-blue-700",
  INTERVIEW: "bg-violet-100 text-violet-700",
  TECHNICAL_TEST: "bg-orange-100 text-orange-700",
  OFFER: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-rose-100 text-rose-700",
}

const STATUS_DOT: Record<ApplicationStatus, string> = {
  SAVED: "bg-slate-400",
  APPLIED: "bg-blue-500",
  INTERVIEW: "bg-violet-500",
  TECHNICAL_TEST: "bg-orange-500",
  OFFER: "bg-emerald-500",
  REJECTED: "bg-rose-500",
}

/* ---------- Small reusable modal ---------- */

interface ModalProps {
  title: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
}

function Modal({ title, subtitle, onClose, children }: ModalProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    document.addEventListener("keydown", onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl sm:p-8"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{title}</h3>
            {subtitle && (
              <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            )}
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            ✕
          </button>
        </div>

        {children}
      </div>
    </div>
  )
}

/* ---------- Page ---------- */

function Dashboard() {
  const [applications, setApplications] = useState<Application[]>([])
  const [stats, setStats] = useState<ApplicationStats | null>(null)

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

  const [showAddForm, setShowAddForm] = useState(false)
  const [editingApplication, setEditingApplication] =
    useState<Application | null>(null)

  const [loading, setLoading] = useState(true) // first load only
  const [fetching, setFetching] = useState(false) // any reload
  const [statsLoading, setStatsLoading] = useState(true)

  const [error, setError] = useState("")
  const [statsError, setStatsError] = useState("")
  const [actionError, setActionError] = useState("")
  const [notice, setNotice] = useState("")

  // Used to ignore outdated responses (fast typing in the search box)
  const applicationsRequestId = useRef(0)

  const loadApplications = useCallback(async () => {
    const requestId = ++applicationsRequestId.current

    try {
      setFetching(true)
      setError("")

      const data = await getApplications(search, statusFilter)

      if (requestId !== applicationsRequestId.current) return
      setApplications(data)
    } catch (err) {
      if (requestId !== applicationsRequestId.current) return

      setError(
        err instanceof Error
          ? err.message
          : "We couldn't load your applications."
      )
    } finally {
      if (requestId === applicationsRequestId.current) {
        setLoading(false)
        setFetching(false)
      }
    }
  }, [search, statusFilter])

  const loadStatistics = useCallback(async () => {
    try {
      setStatsError("")

      const data = await getApplicationStats()
      setStats(data)
    } catch (err) {
      setStatsError(
        err instanceof Error
          ? err.message
          : "We couldn't load your statistics."
      )
    } finally {
      setStatsLoading(false)
    }
  }, [])

  const refreshDashboard = useCallback(async () => {
    await Promise.all([loadApplications(), loadStatistics()])
  }, [loadApplications, loadStatistics])

  // Search + filter (debounced)
  useEffect(() => {
    const timeout = setTimeout(loadApplications, 300)
    return () => clearTimeout(timeout)
  }, [loadApplications])

  useEffect(() => {
    loadStatistics()
  }, [loadStatistics])

  // Auto-hide the success message
  useEffect(() => {
    if (!notice) return

    const timeout = setTimeout(() => setNotice(""), 3500)
    return () => clearTimeout(timeout)
  }, [notice])

  const closeAddForm = useCallback(() => setShowAddForm(false), [])
  const closeEditForm = useCallback(() => setEditingApplication(null), [])

  const handleApplicationAdded = async () => {
    setShowAddForm(false)
    setActionError("")
    setNotice("Application added.")
    await refreshDashboard()
  }

  const handleApplicationUpdated = async () => {
    setEditingApplication(null)
    setActionError("")
    setNotice("Application updated.")
    await refreshDashboard()
  }

  const handleDelete = async (application: Application) => {
    const confirmed = window.confirm(
      `Delete your application to ${application.company}? This can't be undone.`
    )

    if (!confirmed) return

    try {
      setActionError("")
      await deleteApplication(application.id)
      setNotice("Application deleted.")
      await refreshDashboard()
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "We couldn't delete this application."
      )
    }
  }

  const handleLogout = () => {
    logout()
    window.location.href = "/"
  }

  const countFor = (status: ApplicationStatus): number => {
    const byStatus = stats?.by_status as unknown as
      | Record<string, number>
      | undefined

    return byStatus?.[status] ?? 0
  }

  const total = stats?.total ?? 0
  const hasFilters = search !== "" || statusFilter !== ""

  const clearFilters = () => {
    setSearch("")
    setStatusFilter("")
  }

  const toggleStatusFilter = (status: ApplicationStatus) => {
    setStatusFilter((current) => (current === status ? "" : status))
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white">
              J
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">JobFlow</h1>
              <p className="hidden text-xs text-slate-500 sm:block">
                Your job search, organized
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={refreshDashboard}
              disabled={fetching || statsLoading}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50"
            >
              {fetching ? "Refreshing…" : "Refresh"}
            </button>

            <button
              onClick={handleLogout}
              className="rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* HERO */}
        <section className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {statsLoading
                ? "Loading your dashboard…"
                : total === 0
                  ? "Let's start your job search"
                  : `You're tracking ${total} ${total === 1 ? "application" : "applications"}`}
            </h2>
            <p className="mt-2 max-w-xl text-slate-500">
              {total === 0
                ? "Add your first application and watch your progress grow here."
                : "Click a stage below to filter your list, or add a new application."}
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            <span className="text-lg leading-none">+</span>
            Add application
          </button>
        </section>

        {/* SUCCESS MESSAGE */}
        {notice && (
          <div
            role="status"
            className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"
          >
            {notice}
          </div>
        )}

        {/* PIPELINE (clickable filters) */}
        <section className="mb-8" aria-label="Application stages">
          {statsError && (
            <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">
              <span>{statsError}</span>
              <button
                onClick={loadStatistics}
                className="font-semibold underline"
              >
                Try again
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {STATUS_OPTIONS.map((status) => {
              const active = statusFilter === status

              return (
                <button
                  key={status}
                  onClick={() => toggleStatusFilter(status)}
                  aria-pressed={active}
                  className={`rounded-2xl border bg-white p-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    active
                      ? "border-indigo-500 ring-2 ring-indigo-100"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <span
                      className={`h-2 w-2 rounded-full ${STATUS_DOT[status]}`}
                    />
                    {STATUS_LABELS[status]}
                  </div>

                  <p className="mt-2 text-2xl font-bold">
                    {statsLoading ? "–" : countFor(status)}
                  </p>
                </button>
              )
            })}
          </div>
        </section>

        {/* CHARTS */}
        {!statsLoading && !statsError && stats && total > 0 && (
          <StatisticsCharts stats={stats} />
        )}

        {/* APPLICATION LIST */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-lg font-semibold">My applications</h3>
              <p className="mt-1 text-sm text-slate-500">
                Search by company or position, or filter by stage.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="search"
                placeholder="Search company or position…"
                aria-label="Search applications"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:w-64"
              />

              <select
                value={statusFilter}
                aria-label="Filter by status"
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="">All stages</option>

                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {actionError && (
            <div
              role="alert"
              className="mx-5 mt-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-700 sm:mx-6"
            >
              {actionError}
            </div>
          )}

          {/* FIRST LOAD */}
          {loading && (
            <div className="space-y-3 p-6" aria-busy="true">
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="h-14 animate-pulse rounded-xl bg-slate-100"
                />
              ))}
            </div>
          )}

          {/* ERROR */}
          {!loading && error && (
            <div className="p-10 text-center">
              <p className="text-sm text-rose-600">{error}</p>
              <button
                onClick={loadApplications}
                className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Try again
              </button>
            </div>
          )}

          {/* EMPTY */}
          {!loading && !error && applications.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-4xl" aria-hidden="true">
                {hasFilters ? "🔍" : "📂"}
              </p>

              <h4 className="mt-4 font-semibold">
                {hasFilters
                  ? "No applications match your filters"
                  : "No applications yet"}
              </h4>

              <p className="mt-2 text-sm text-slate-500">
                {hasFilters
                  ? "Try a different search or clear the filters."
                  : "Add your first application to start tracking."}
              </p>

              {hasFilters ? (
                <button
                  onClick={clearFilters}
                  className="mt-5 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Clear filters
                </button>
              ) : (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="mt-5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  Add application
                </button>
              )}
            </div>
          )}

          {/* LIST */}
          {!loading && !error && applications.length > 0 && (
            <div
              className={`transition-opacity ${fetching ? "opacity-60" : ""}`}
            >
              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-medium text-slate-500">
                    <tr>
                      <th className="px-6 py-3">Company</th>
                      <th className="px-6 py-3">Position</th>
                      <th className="px-6 py-3">Location</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Salary</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {applications.map((application) => (
                      <tr
                        key={application.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-sm font-bold text-indigo-600">
                              {application.company.charAt(0).toUpperCase()}
                            </span>
                            <span className="font-medium">
                              {application.company}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-slate-700">
                          {application.position}
                        </td>

                        <td className="px-6 py-4 text-slate-500">
                          {application.location || "—"}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${STATUS_BADGE[application.status]}`}
                          >
                            {STATUS_LABELS[application.status]}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-slate-600">
                          {application.salary || "—"}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() =>
                                setEditingApplication(application)
                              }
                              className="rounded-lg px-3 py-1.5 text-xs font-medium text-indigo-600 transition hover:bg-indigo-50"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => handleDelete(application)}
                              className="rounded-lg px-3 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="grid grid-cols-1 gap-3 p-4 md:hidden">
                {applications.map((application) => (
                  <article
                    key={application.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="truncate font-semibold">
                          {application.company}
                        </h4>
                        <p className="mt-1 text-sm text-slate-600">
                          {application.position}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_BADGE[application.status]}`}
                      >
                        {STATUS_LABELS[application.status]}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1 text-sm text-slate-500">
                      <p>📍 {application.location || "No location"}</p>
                      <p>💰 {application.salary || "No salary"}</p>
                    </div>

                    <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3">
                      <button
                        onClick={() => setEditingApplication(application)}
                        className="flex-1 rounded-lg bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(application)}
                        className="flex-1 rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100"
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              <div className="border-t border-slate-200 px-5 py-4 text-xs text-slate-400 sm:px-6">
                Showing {applications.length}{" "}
                {applications.length === 1 ? "application" : "applications"}
                {hasFilters && " matching your filters"}.
              </div>
            </div>
          )}
        </section>

        <footer className="py-8 text-center text-xs text-slate-400">
          JobFlow © {new Date().getFullYear()}
        </footer>
      </main>

      {/* ADD MODAL */}
      {showAddForm && (
        <Modal
          title="Add an application"
          subtitle="Save a new job opportunity to your tracker."
          onClose={closeAddForm}
        >
          <AddApplicationForm
            onApplicationCreated={handleApplicationAdded}
            onCancel={closeAddForm}
          />
        </Modal>
      )}

      {/* EDIT MODAL */}
      {editingApplication && (
        <Modal
          title="Edit application"
          subtitle={`${editingApplication.company} · ${editingApplication.position}`}
          onClose={closeEditForm}
        >
          <EditApplicationForm
            application={editingApplication}
            onApplicationUpdated={handleApplicationUpdated}
            onCancel={closeEditForm}
          />
        </Modal>
      )}
    </div>
  )
}

export default Dashboard