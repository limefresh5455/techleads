import { useState, useEffect } from 'react'
import {
  Home,
  Users,
  Globe,
  LinkIcon,
  Folder,
  MessageSquare,
  CreditCard,
  DollarSign,
  UserCheck,
  ShieldAlert,
} from 'lucide-react'
import { adminDashboard } from '../../services'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

const COLORS = ['#FF6B35', '#004E89', '#FFC857', '#4C9F70', '#8B5A8C']

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const data = await adminDashboard.getStats()
      setStats(data)
    } catch (err) {
      console.error('Failed to load dashboard stats', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-8 text-ink">Loading dashboard...</div>
  if (!stats) return <div className="p-8 text-red-500">Failed to load dashboard stats.</div>

  const formatCurrency = (cents) => `$${(cents / 100).toFixed(2)}`

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <h1 className="text-2xl font-bold text-ink flex items-center gap-3">
          <Home className="text-brand-dark" />
          Dashboard
        </h1>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-muted">
            <Users size={18} />
            <span className="text-sm font-semibold uppercase tracking-wider">Total Users</span>
          </div>
          <div className="text-3xl font-extrabold text-ink">
            {stats.total_users.toLocaleString()}
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-muted">
            <UserCheck size={18} />
            <span className="text-sm font-semibold uppercase tracking-wider">Customers</span>
          </div>
          <div className="text-3xl font-extrabold text-ink">
            {stats.total_customers.toLocaleString()}
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-muted">
            <ShieldAlert size={18} />
            <span className="text-sm font-semibold uppercase tracking-wider">Admins</span>
          </div>
          <div className="text-3xl font-extrabold text-ink">
            {stats.total_admins.toLocaleString()}
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-muted">
            <CreditCard size={18} />
            <span className="text-sm font-semibold uppercase tracking-wider">Paid Customers</span>
          </div>
          <div className="text-3xl font-extrabold text-ink">
            {stats.active_plans.toLocaleString()}
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-muted">
            <DollarSign size={18} />
            <span className="text-sm font-semibold uppercase tracking-wider">Total Revenue</span>
          </div>
          <div className="text-3xl font-extrabold text-ink">
            {formatCurrency(stats.total_revenue)}
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-muted">
            <LinkIcon size={18} />
            <span className="text-sm font-semibold uppercase tracking-wider">Websites</span>
          </div>
          <div className="text-3xl font-extrabold text-ink">
            {stats.total_websites.toLocaleString()}
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-muted">
            <Globe size={18} />
            <span className="text-sm font-semibold uppercase tracking-wider">Technologies</span>
          </div>
          <div className="text-3xl font-extrabold text-ink">
            {stats.total_technologies.toLocaleString()}
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-muted">
            <Folder size={18} />
            <span className="text-sm font-semibold uppercase tracking-wider">Categories</span>
          </div>
          <div className="text-3xl font-extrabold text-ink">
            {stats.total_categories.toLocaleString()}
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-muted">
            <MessageSquare size={18} />
            <span className="text-sm font-semibold uppercase tracking-wider">Messages</span>
          </div>
          <div className="text-3xl font-extrabold text-ink">
            {stats.total_messages.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Graph */}
        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm min-w-0">
          <h2 className="text-lg font-bold text-ink mb-4 truncate">Revenue (Last 30 Days)</h2>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.revenue_graph}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#FF6B35" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#888"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(val) => {
                    const d = new Date(val)
                    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
                  }}
                />
                <YAxis
                  stroke="#888"
                  tickFormatter={(val) => '$' + (val / 100).toFixed(0)}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(val) => ['$' + (val / 100).toFixed(2), 'Revenue']}
                  contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff' }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#FF6B35"
                  strokeWidth={3}
                  activeDot={{ r: 6 }}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Plan Distribution Chart */}
        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm min-w-0">
          <h2 className="text-lg font-bold text-ink mb-4 truncate">Paid Plans Distribution</h2>
          <div className="w-full h-72">
            {stats.plan_distribution && stats.plan_distribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.plan_distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius="60%"
                    outerRadius="80%"
                    paddingAngle={5}
                    cornerRadius={8}
                    dataKey="value"
                  >
                    {stats.plan_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted">
                No paid plan data available
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Signups */}
        <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-border bg-card">
            <h2 className="text-lg font-bold text-ink">Recent Signups</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-ink">
              <thead className="bg-card text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stats.recent_signups.map((user, idx) => (
                  <tr key={idx} className="hover:bg-card/50">
                    <td className="px-4 py-3 font-medium">{user.name}</td>
                    <td className="px-4 py-3 text-muted">{user.email}</td>
                    <td className="px-4 py-3 text-xs">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {stats.recent_signups.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-muted">
                      No recent signups
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Messages */}
        <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-border bg-card">
            <h2 className="text-lg font-bold text-ink">Recent Messages</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-ink">
              <thead className="bg-card text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">From</th>
                  <th className="px-4 py-3 font-semibold">Message</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stats.recent_messages.map((msg, idx) => (
                  <tr key={idx} className="hover:bg-card/50">
                    <td className="px-4 py-3">
                      <div className="font-medium">{msg.name}</div>
                      <div className="text-xs text-muted">{msg.email}</div>
                    </td>
                    <td className="px-4 py-3 max-w-[200px] truncate" title={msg.message}>
                      {msg.message}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {new Date(msg.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {stats.recent_messages.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-muted">
                      No recent messages
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
