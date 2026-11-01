import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Dashboard from '../pages/Dashboard'

import {
  getApplications,
  deleteApplication,
} from '../services/applications'

import { getApplicationStats } from '../services/statistics'

vi.mock('../services/applications', () => ({
  getApplications: vi.fn(),
  deleteApplication: vi.fn(),
}))

vi.mock('../services/statistics', () => ({
  getApplicationStats: vi.fn(),
}))

vi.mock('../services/auth', () => ({
  logout: vi.fn(),
}))

vi.mock('../components/StatisticsCharts', () => ({
  default: () => <div>Statistics charts</div>,
}))

vi.mock('../components/AddApplicationForm', () => ({
  default: ({ onCancel }: { onCancel: () => void }) => (
    <div>
      <p>Add form mock</p>
      <button onClick={onCancel}>Cancel add</button>
    </div>
  ),
}))

vi.mock('../components/EditApplicationForm', () => ({
  default: ({ onCancel }: { onCancel: () => void }) => (
    <div>
      <p>Edit form mock</p>
      <button onClick={onCancel}>Cancel edit</button>
    </div>
  ),
}))

const mockedGetApplications = vi.mocked(getApplications)
const mockedDeleteApplication = vi.mocked(deleteApplication)
const mockedGetApplicationStats = vi.mocked(getApplicationStats)

const sampleApplication = {
  id: 1,
  company: 'Google',
  position: 'Software Engineer',
  location: 'Tunis',
  status: 'APPLIED',
  job_url: 'https://example.com/job',
  salary: '2500-3000 DT',
  applied_at: '2026-10-20',
  created_at: '2026-10-20T10:00:00',
  updated_at: '2026-10-20T10:00:00',
} as import('../types/application').Application

const sampleStats = {
  total: 1,
  by_status: {
    SAVED: 0,
    APPLIED: 1,
    INTERVIEW: 0,
    TECHNICAL_TEST: 0,
    OFFER: 0,
    REJECTED: 0,
  },
} as import('../types/statistics').ApplicationStats

// The list is rendered twice (desktop table + mobile cards): jsdom has no
// CSS, so both are in the DOM. We wait for "at least one" match.
const waitForApplications = () => screen.findAllByText('Google')

describe('Dashboard component', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockedGetApplications.mockResolvedValue([sampleApplication])
    mockedGetApplicationStats.mockResolvedValue(sampleStats)
    mockedDeleteApplication.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('displays the dashboard and applications', async () => {
    render(<Dashboard />)

    expect(
      screen.getByRole('heading', { name: 'JobFlow' })
    ).toBeInTheDocument()

    const companies = await waitForApplications()
    expect(companies.length).toBeGreaterThan(0)

    expect(screen.getAllByText('Software Engineer').length).toBeGreaterThan(0)

    expect(await screen.findByText('Statistics charts')).toBeInTheDocument()
  })

  it('loads application statistics', async () => {
    render(<Dashboard />)

    expect(
      await screen.findByText("You're tracking 1 application")
    ).toBeInTheDocument()

    expect(mockedGetApplicationStats).toHaveBeenCalled()
  })

  it('searches applications by company or position', async () => {
    const user = userEvent.setup()

    render(<Dashboard />)
    await waitForApplications()

    await user.type(
      screen.getByRole('searchbox', { name: 'Search applications' }),
      'Google'
    )

    await waitFor(() => {
      expect(mockedGetApplications).toHaveBeenLastCalledWith('Google', '')
    })
  })

  it('filters applications by status', async () => {
    const user = userEvent.setup()

    render(<Dashboard />)
    await waitForApplications()

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Filter by status' }),
      'APPLIED'
    )

    await waitFor(() => {
      expect(mockedGetApplications).toHaveBeenLastCalledWith('', 'APPLIED')
    })
  })

  it('opens and closes the add application form', async () => {
    const user = userEvent.setup()

    render(<Dashboard />)
    await waitForApplications()

    // Accessible name is "+ Add application", so we use a regex
    await user.click(screen.getByRole('button', { name: /add application/i }))

    expect(screen.getByText('Add form mock')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Cancel add' }))

    expect(screen.queryByText('Add form mock')).not.toBeInTheDocument()
  })

  it('opens and closes the edit application form', async () => {
    const user = userEvent.setup()

    render(<Dashboard />)
    await waitForApplications()

    await user.click(screen.getAllByRole('button', { name: 'Edit' })[0])

    expect(screen.getByText('Edit form mock')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Cancel edit' }))

    expect(screen.queryByText('Edit form mock')).not.toBeInTheDocument()
  })

  it('deletes an application after confirmation', async () => {
    const user = userEvent.setup()

    vi.spyOn(window, 'confirm').mockReturnValue(true)

    render(<Dashboard />)
    await waitForApplications()

    await user.click(screen.getAllByRole('button', { name: 'Delete' })[0])

    await waitFor(() => {
      expect(mockedDeleteApplication).toHaveBeenCalledWith(1)
    })

    expect(window.confirm).toHaveBeenCalled()
  })

  it('does not delete when the confirmation is cancelled', async () => {
    const user = userEvent.setup()

    vi.spyOn(window, 'confirm').mockReturnValue(false)

    render(<Dashboard />)
    await waitForApplications()

    await user.click(screen.getAllByRole('button', { name: 'Delete' })[0])

    expect(mockedDeleteApplication).not.toHaveBeenCalled()
  })
})