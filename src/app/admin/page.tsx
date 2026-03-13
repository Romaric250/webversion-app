'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import {
  Users,
  BookOpen,
  Search,
  Crown,
  MessageSquare,
  Mic2,
  UsersRound,
  MessageCircle,
  FileText,
  GraduationCap,
} from 'lucide-react'
import { apiClient } from '@/services/api/client'
import { API_ENDPOINTS } from '@/config/api'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

interface Stats {
  usersCount: number
  premiumCount: number
  signsCount: number
  coursesCount: number
  enrollmentsCount: number
  feedbackCount: number
  transcriptionsCount: number
  groupsCount: number
  chatMessagesCount: number
  groupMessagesCount: number
  totalMessagesCount: number
  notesCount: number
}

interface ChartData {
  labels: string[]
  usersData: number[]
  transcriptionsData: number[]
  messagesData: number[]
  groupsData: number[]
  notesData: number[]
}

const statCards = [
  { key: 'usersCount', label: 'Total users', icon: Users, color: 'primary' },
  { key: 'transcriptionsCount', label: 'Voice transcriptions', icon: Mic2, color: 'emerald' },
  { key: 'groupsCount', label: 'Groups', icon: UsersRound, color: 'violet' },
  { key: 'totalMessagesCount', label: 'Total messages', icon: MessageCircle, color: 'blue' },
  { key: 'notesCount', label: 'Notes', icon: FileText, color: 'amber' },
  { key: 'signsCount', label: 'Dictionary signs', icon: Search, color: 'primary' },
  { key: 'coursesCount', label: 'Courses', icon: BookOpen, color: 'primary' },
  { key: 'enrollmentsCount', label: 'Course enrollments', icon: GraduationCap, color: 'emerald' },
  { key: 'feedbackCount', label: 'Feedback', icon: MessageSquare, color: 'primary' },
  { key: 'premiumCount', label: 'Premium users', icon: Crown, color: 'amber' },
] as const

const colorMap: Record<string, string> = {
  primary: 'bg-primary/20 text-primary',
  emerald: 'bg-emerald-500/20 text-emerald-400',
  violet: 'bg-violet-500/20 text-violet-400',
  blue: 'bg-blue-500/20 text-blue-400',
  amber: 'bg-amber-500/20 text-amber-400',
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await apiClient.get<{ success: boolean; data: Stats }>(
          API_ENDPOINTS.ADMIN.STATS
        )
        if (data.success) setStats(data.data)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load stats')
      }
    }
    fetchStats()
  }, [])

  useEffect(() => {
    const fetchChart = async () => {
      try {
        const { data } = await apiClient.get<{ success: boolean; data: ChartData }>(
          `${API_ENDPOINTS.ADMIN.CHART_DATA}?days=14`
        )
        if (data.success) setChartData(data.data)
      } catch {
        // ignore
      }
    }
    fetchChart()
  }, [])

  if (error) {
    return (
      <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
        {error}
      </div>
    )
  }

  const chartOptions = chartData
    ? {
        chart: {
          type: 'area' as const,
          toolbar: { show: false },
          zoom: { enabled: false },
          fontFamily: 'inherit',
          background: 'transparent',
          foreColor: '#9ca3af',
        },
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth' as const, width: 2 },
        fill: {
          type: 'gradient',
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.4,
            opacityTo: 0.1,
          },
        },
        xaxis: {
          categories: chartData.labels.map((l) => {
            const d = new Date(l)
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          }),
          labels: { style: { colors: '#6b7280', fontSize: '11px' } },
        },
        yaxis: {
          labels: { style: { colors: '#6b7280' } },
        },
        grid: {
          borderColor: '#1e3328',
          strokeDashArray: 4,
          xaxis: { lines: { show: false } },
        },
        legend: {
          labels: { colors: '#9ca3af' },
          position: 'top' as const,
        },
        colors: ['#38E078', '#8b5cf6', '#3b82f6', '#a855f7', '#f59e0b'],
      }
    : null

  const chartSeries = chartData
    ? [
        { name: 'New users', data: chartData.usersData },
        { name: 'Transcriptions', data: chartData.transcriptionsData },
        { name: 'Messages', data: chartData.messagesData },
        { name: 'Groups', data: chartData.groupsData },
        { name: 'Notes', data: chartData.notesData },
      ]
    : []

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-white/60 text-sm mt-1">Overview of SignNova platform metrics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {statCards.map(({ key, label, icon: Icon, color }) => (
          <div
            key={key}
            className="rounded-xl bg-background-secondary border border-background-tertiary p-5 hover:border-primary/20 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colorMap[color] || colorMap.primary}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold text-white tabular-nums">
                  {stats ? (stats[key as keyof Stats] as number | undefined)?.toLocaleString() ?? '—' : '—'}
                </p>
                <p className="text-white/60 text-sm truncate">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-xl bg-background-secondary border border-background-tertiary p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Activity (last 14 days)</h2>
          {chartData && chartData.labels.length > 0 ? (
            <Chart
              options={chartOptions ?? undefined}
              series={chartSeries}
              type="area"
              height={280}
            />
          ) : (
            <div className="h-[280px] flex items-center justify-center text-white/40 text-sm">
              No data yet
            </div>
          )}
        </div>
        <div className="rounded-xl bg-background-secondary border border-background-tertiary p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Messages breakdown</h2>
          {stats && (stats.chatMessagesCount > 0 || stats.groupMessagesCount > 0) ? (
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-full sm:w-48 flex-shrink-0">
                <Chart
                  options={{
                    chart: {
                      type: 'donut',
                      fontFamily: 'inherit',
                      background: 'transparent',
                      foreColor: '#9ca3af',
                    },
                    labels: ['Chat', 'Groups'],
                    colors: ['#38E078', '#8b5cf6'],
                    legend: { position: 'bottom', labels: { colors: '#9ca3af' } },
                    dataLabels: { enabled: true },
                    plotOptions: {
                      pie: {
                        donut: { size: '65%', labels: { show: true, total: { show: true, label: 'Total' } } },
                      },
                    },
                  }}
                  series={[stats.chatMessagesCount, stats.groupMessagesCount]}
                  type="donut"
                  height={220}
                />
              </div>
              <div className="flex-1 space-y-3 w-full">
                <div className="flex justify-between py-2 border-b border-background-tertiary">
                  <span className="text-white/80">Chat messages</span>
                  <span className="font-bold text-white tabular-nums">
                    {stats.chatMessagesCount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-background-tertiary">
                  <span className="text-white/80">Group messages</span>
                  <span className="font-bold text-white tabular-nums">
                    {stats.groupMessagesCount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-white font-medium">Total</span>
                  <span className="text-xl font-bold text-primary tabular-nums">
                    {stats.totalMessagesCount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-white/40 text-sm">
              No messages yet
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
