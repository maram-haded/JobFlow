import { useState } from "react"
import {
  updateApplication,
  type CreateApplicationData,
} from "../services/applications"
import type {
  Application,
  ApplicationStatus,
} from "../types/application"


interface EditApplicationFormProps {
  application: Application

  onApplicationUpdated: (
    application: Application
  ) => void

  onCancel: () => void
}


function EditApplicationForm({
  application,
  onApplicationUpdated,
  onCancel,
}: EditApplicationFormProps) {

  const [company, setCompany] =
    useState(application.company)

  const [position, setPosition] =
    useState(application.position)

  const [location, setLocation] =
    useState(application.location ?? "")

  const [status, setStatus] =
    useState<ApplicationStatus>(
      application.status
    )

  const [jobUrl, setJobUrl] =
    useState(application.job_url ?? "")

  const [salary, setSalary] =
    useState(application.salary ?? "")

  const [appliedAt, setAppliedAt] =
    useState(
      application.applied_at
        ? application.applied_at.slice(0, 10)
        : ""
    )

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState("")


  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {

    event.preventDefault()

    setError("")
    setLoading(true)


    const data: Partial<CreateApplicationData> = {
      company,
      position,
      location: location || null,
      status,
      job_url: jobUrl || null,
      salary: salary || null,
      applied_at: appliedAt
        ? new Date(appliedAt).toISOString()
        : null,
    }


    try {

      const updatedApplication =
        await updateApplication(
          application.id,
          data
        )

      onApplicationUpdated(
        updatedApplication
      )

    } catch (error) {

      setError(
        error instanceof Error
          ? error.message
          : "Impossible de modifier la candidature."
      )

    } finally {

      setLoading(false)

    }
  }


  return (
    <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">

      <div className="mb-6 flex items-center justify-between">

        <div>
          <h3 className="text-xl font-bold text-slate-900">
            Edit Application
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Update your application information.
          </p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          Cancel
        </button>

      </div>


      <form
        onSubmit={handleSubmit}
        className="grid gap-5 md:grid-cols-2"
      >

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Company
          </label>

          <input
            value={company}
            onChange={(event) =>
              setCompany(event.target.value)
            }
            required
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
          />
        </div>


        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Position
          </label>

          <input
            value={position}
            onChange={(event) =>
              setPosition(event.target.value)
            }
            required
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
          />
        </div>


        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Location
          </label>

          <input
            value={location}
            onChange={(event) =>
              setLocation(event.target.value)
            }
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
          />
        </div>


        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Status
          </label>

          <select
            value={status}
            onChange={(event) =>
              setStatus(
                event.target.value as ApplicationStatus
              )
            }
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
          >
            <option value="SAVED">Saved</option>
            <option value="APPLIED">Applied</option>
            <option value="INTERVIEW">Interview</option>
            <option value="TECHNICAL_TEST">
              Technical Test
            </option>
            <option value="OFFER">Offer</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>


        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Salary
          </label>

          <input
            value={salary}
            onChange={(event) =>
              setSalary(event.target.value)
            }
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
          />
        </div>


        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Applied Date
          </label>

          <input
            type="date"
            value={appliedAt}
            onChange={(event) =>
              setAppliedAt(event.target.value)
            }
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
          />
        </div>


        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Job URL
          </label>

          <input
            type="url"
            value={jobUrl}
            onChange={(event) =>
              setJobUrl(event.target.value)
            }
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
          />
        </div>


        {error && (
          <div className="md:col-span-2 rounded-lg bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}


        <div className="md:col-span-2 flex justify-end gap-3">

          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-300 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-slate-900 px-5 py-3 font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {loading
              ? "Saving..."
              : "Save Changes"}
          </button>

        </div>

      </form>
    </div>
  )
}


export default EditApplicationForm