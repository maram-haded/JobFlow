import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"

import type { ApplicationStats } from "../types/statistics"

interface StatisticsChartsProps {
  stats: ApplicationStats
}

const STATUS_ORDER = [
  "SAVED",
  "APPLIED",
  "INTERVIEW",
  "TECHNICAL_TEST",
  "OFFER",
  "REJECTED",
] as const

const STATUS_COLORS: Record<string, string> = {
  SAVED: "#94a3b8",
  APPLIED: "#3b82f6",
  INTERVIEW: "#8b5cf6",
  TECHNICAL_TEST: "#f97316",
  OFFER: "#10b981",
  REJECTED: "#f43f5e",
}

const STATUS_LABELS: Record<string, string> = {
  SAVED: "Saved",
  APPLIED: "Applied",
  INTERVIEW: "Interview",
  TECHNICAL_TEST: "Technical test",
  OFFER: "Offer",
  REJECTED: "Rejected",
}

function StatisticsCharts({ stats }: StatisticsChartsProps) {
  // Safe access: a missing status counts as 0 (avoids NaN in the rates)
  const byStatus = stats.by_status as unknown as Record<string, number>

  const chartData = STATUS_ORDER.map((status) => ({
    status,
    name: STATUS_LABELS[status],
    value: byStatus?.[status] ?? 0,
    fill: STATUS_COLORS[status],
  }))

  const pieData = chartData.filter((item) => item.value > 0)

  const total = stats.total ?? 0

  const reachedInterview =
    (byStatus?.INTERVIEW ?? 0) +
    (byStatus?.TECHNICAL_TEST ?? 0) +
    (byStatus?.OFFER ?? 0)

  const interviewRate = total > 0 ? (reachedInterview / total) * 100 : 0
  const offerRate = total > 0 ? ((byStatus?.OFFER ?? 0) / total) * 100 : 0

  return (
    <section className="mb-8" aria-label="Application analytics">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Your progress</h3>
        <p className="mt-1 text-sm text-slate-500">
          How your applications are moving through each stage.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Donut */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
          <h4 className="mb-2 font-semibold text-slate-900">By status</h4>

          <div className="relative">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={95}
                  paddingAngle={pieData.length > 1 ? 3 : 0}
                  stroke="none"
                >
                  {pieData.map((item) => (
                    <Cell key={item.status} fill={item.fill} />
                  ))}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-slate-900">{total}</span>
              <span className="text-xs text-slate-500">total</span>
            </div>
          </div>

          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {chartData.map((item) => (
              <li
                key={item.status}
                className="flex items-center justify-between gap-2 text-slate-600"
              >
                <span className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: item.fill }}
                  />
                  {item.name}
                </span>
                <span className="font-semibold text-slate-900">
                  {item.value}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bars */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-3">
          <h4 className="mb-4 font-semibold text-slate-900">
            Stage comparison
          </h4>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e2e8f0"
              />

              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
                angle={-20}
                textAnchor="end"
                interval={0}
                height={60}
              />

              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip cursor={{ fill: "#f1f5f9" }} />

              <Bar
                dataKey="value"
                name="Applications"
                radius={[8, 8, 0, 0]}
                maxBarSize={48}
              >
                {chartData.map((item) => (
                  <Cell key={item.status} fill={item.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Rates */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <RateCard
          title="Interview rate"
          value={interviewRate}
          barClass="bg-violet-500"
          textClass="text-violet-600"
          description="Applications that reached an interview, a technical test or an offer."
        />

        <RateCard
          title="Offer rate"
          value={offerRate}
          barClass="bg-emerald-500"
          textClass="text-emerald-600"
          description="Applications that turned into an offer."
        />
      </div>
    </section>
  )
}

interface RateCardProps {
  title: string
  value: number
  barClass: string
  textClass: string
  description: string
}

function RateCard({
  title,
  value,
  barClass,
  textClass,
  description,
}: RateCardProps) {
  const safeValue = Math.min(100, Math.max(0, value))

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className={`text-2xl font-bold ${textClass}`}>
          {safeValue.toFixed(1)}%
        </p>
      </div>

      <div
        className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-valuenow={Math.round(safeValue)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={title}
      >
        <div
          className={`h-full rounded-full transition-all ${barClass}`}
          style={{ width: `${safeValue}%` }}
        />
      </div>

      <p className="mt-3 text-xs text-slate-500">{description}</p>
    </div>
  )
}

export default StatisticsCharts