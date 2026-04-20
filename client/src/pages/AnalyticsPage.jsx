import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Line, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { getGroups, getExpensesByGroup } from '../services/api'
import PageWrapper from '../components/PageWrapper'
import { MdAttachMoney, MdGroup, MdReceipt, MdCheckCircle } from 'react-icons/md'

ChartJS.register(
  CategoryScale, LinearScale, PointElement,
  LineElement, ArcElement, Title, Tooltip, Legend, Filler
)

const Analytics = () => {
  const { darkMode } = useTheme()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalSpent: 0,
    totalGroups: 0,
    totalExpenses: 0,
    totalSettled: 0,
    monthlyData: {},
    categoryData: {},
    groupData: {}
  })

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const { data: groups } = await getGroups()
      let totalSpent = 0
      let totalExpenses = 0
      let totalSettled = 0
      const monthlyData = {}
      const groupData = {}

      await Promise.all(groups.map(async (group) => {
        const { data: expenses } = await getExpensesByGroup(group._id)
        let groupTotal = 0

        expenses.forEach(expense => {
          const isPayer = expense.paidBy._id === user._id
          if (isPayer) {
            totalSpent += expense.amount
            groupTotal += expense.amount
          }
          totalExpenses++

          const month = new Date(expense.date).toLocaleString('default', { month: 'short', year: '2-digit' })
          if (isPayer) {
            monthlyData[month] = (monthlyData[month] || 0) + expense.amount
          }

          expense.splits.forEach(split => {
            if (split.settled) totalSettled++
          })
        })

        if (groupTotal > 0) {
          groupData[group.name] = groupTotal
        }
      }))

      setStats({
        totalSpent,
        totalGroups: groups.length,
        totalExpenses,
        totalSettled,
        monthlyData,
        groupData
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const lineData = {
    labels: Object.keys(stats.monthlyData),
    datasets: [{
      label: 'Amount Spent',
      data: Object.values(stats.monthlyData),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59,130,246,0.1)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#3b82f6',
      pointRadius: 5,
      pointHoverRadius: 8
    }]
  }

  const doughnutData = {
    labels: Object.keys(stats.groupData),
    datasets: [{
      data: Object.values(stats.groupData),
      backgroundColor: [
        '#3b82f6', '#8b5cf6', '#06b6d4',
        '#10b981', '#f59e0b', '#ef4444'
      ],
      borderWidth: 0,
      hoverOffset: 8
    }]
  }

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` $${ctx.parsed.y.toFixed(2)}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
        ticks: { color: darkMode ? '#9ca3af' : '#6b7280' }
      },
      x: {
        grid: { display: false },
        ticks: { color: darkMode ? '#9ca3af' : '#6b7280' }
      }
    }
  }

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: darkMode ? '#9ca3af' : '#6b7280',
          padding: 16,
          font: { size: 12 }
        }
      }
    },
    cutout: '70%'
  }

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 style={{ color: darkMode ? '#ffffff' : '#1f2937' }} className="text-3xl font-bold mb-1">Analytics</h1>
          <p style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Your spending insights</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Spent', value: `$${stats.totalSpent.toFixed(2)}`, icon: MdAttachMoney, color: '#3b82f6' },
{ label: 'Groups', value: stats.totalGroups, icon: MdGroup, color: '#8b5cf6' },
{ label: 'Expenses', value: stats.totalExpenses, icon: MdReceipt, color: '#06b6d4' },
{ label: 'Settled', value: stats.totalSettled, icon: MdCheckCircle, color: '#10b981' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm border border-gray-100 dark:border-gray-700"
            >
              <stat.icon size={28} style={{ color: stat.color }} className="mx-auto mb-1" />
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{loading ? '...' : stat.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-100 dark:border-gray-700"
          >
            <h3 style={{ color: darkMode ? '#ffffff' : '#1f2937' }} className="font-semibold mb-4">
              Spending Over Time
            </h3>
            {loading ? (
              <div className="h-48 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            ) : Object.keys(stats.monthlyData).length === 0 ? (
              <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                No spending data yet
              </div>
            ) : (
              <Line data={lineData} options={lineOptions} height={160} />
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-100 dark:border-gray-700"
          >
            <h3 style={{ color: darkMode ? '#ffffff' : '#1f2937' }} className="font-semibold mb-4">
              Spending by Group
            </h3>
            {loading ? (
              <div className="h-48 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            ) : Object.keys(stats.groupData).length === 0 ? (
              <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                No group data yet
              </div>
            ) : (
              <Doughnut data={doughnutData} options={doughnutOptions} height={160} />
            )}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-100 dark:border-gray-700"
        >
          <h3 style={{ color: darkMode ? '#ffffff' : '#1f2937' }} className="font-semibold mb-4">
            Spending by Group Breakdown
          </h3>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-8 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
              ))}
            </div>
          ) : Object.keys(stats.groupData).length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">No data yet</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(stats.groupData)
                .sort((a, b) => b[1] - a[1])
                .map(([name, amount], index) => {
                  const max = Math.max(...Object.values(stats.groupData))
                  const pct = (amount / max) * 100
                  return (
                    <div key={name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span style={{ color: darkMode ? '#e5e7eb' : '#374151' }}>{name}</span>
                        <span className="text-blue-600 dark:text-blue-400 font-medium">${amount.toFixed(2)}</span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: index * 0.1 }}
                          className="h-full bg-blue-500 rounded-full"
                        ></motion.div>
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </motion.div>
      </div>
    </PageWrapper>
  )
}

export default Analytics