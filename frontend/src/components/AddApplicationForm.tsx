import { useState } from "react"
import {
  createApplication,
  type CreateApplicationData,
} from "../services/applications"
import type {
  Application,
  ApplicationStatus,
} from "../types/application"


interface AddApplicationFormProps {
  onApplicationCreated: (
    application: Application
  ) => void

  onCancel: () => void
}


function AddApplicationForm({
  onApplicationCreated,
  onCancel,
}: AddApplicationFormProps) {
  const [company, setCompany] = useState("")
  const [position, setPosition] = useState("")
  const [location, setLocation] = useState("")
  const [status, setStatus] =
    useState<ApplicationStatus>("SAVED")
  const [jobUrl, setJobUrl] = useState("")
  const [salary, setSalary] = useState("")
  const [appliedAt, setAppliedAt] = useState("")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")


  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    setError("")
    setLoading(true)

    const applicationData: CreateApplicationData = {
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
      const newApplication =
        await createApplication(applicationData)

      onApplicationCreated(newApplication)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Impossible d'ajouter la candidature."
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
            Add Application
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Add a new job application to JobFlow.
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
          <label
            htmlFor="company"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Company *
          </label>

          <input
            id="company"
            type="text"
            value={company}
            onChange={(event) =>
              setCompany(event.target.value)
            }
            required
            placeholder="Example: Vermeg"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
          />
        </div>


        <div>
          <label
            htmlFor="position"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Position *
          </label>

          <input
            id="position"
            type="text"
            value={position}
            onChange={(event) =>
              setPosition(event.target.value)
            }
            required
            placeholder="Example: Backend Developer"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
          />
        </div>


        <div>
          <label
            htmlFor="location"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Location
          </label>

          <input
            id="location"
            type="text"
            value={location}
            onChange={(event) =>
              setLocation(event.target.value)
            }
            placeholder="Example: Tunis"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
          />
        </div>


        <div>
          <label
            htmlFor="status"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Status
          </label>

          <select
            id="status"
            value={status}
            onChange={(event) =>
              setStatus(
                event.target.value as ApplicationStatus
              )
            }
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
          >
            <option value="SAVED">
              Saved
            </option>

            <option value="APPLIED">
              Applied
            </option>

            <option value="INTERVIEW">
              Interview
            </option>

            <option value="TECHNICAL_TEST">
              Technical Test
            </option>

            <option value="OFFER">
              Offer
            </option>

            <option value="REJECTED">
              Rejected
            </option>
          </select>
        </div>


        <div>
          <label
            htmlFor="salary"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Salary
          </label>

          <input
            id="salary"
            type="text"
            value={salary}
            onChange={(event) =>
              setSalary(event.target.value)
            }
            placeholder="Example: 2500-3000 DT"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
          />
        </div>


        <div>
          <label
            htmlFor="appliedAt"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Applied Date
          </label>

          <input
            id="appliedAt"
            type="date"
            value={appliedAt}
            onChange={(event) =>
              setAppliedAt(event.target.value)
            }
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
          />
        </div>


        <div className="md:col-span-2">
          <label
            htmlFor="jobUrl"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Job URL
          </label>

          <input
            id="jobUrl"
            type="url"
            value={jobUrl}
            onChange={(event) =>
              setJobUrl(event.target.value)
            }
            placeholder="https://..."
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
            className="rounded-lg bg-slate-900 px-5 py-3 font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Adding..."
              : "Add Application"}
          </button>
        </div>
      </form>
    </div>
  )
}


export default AddApplicationForm