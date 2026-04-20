import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  getGroupById,
  getExpensesByGroup,
  createExpense,
  deleteExpense,
  settleExpense,
  addMember,
  getRates
} from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { toast } from 'react-toastify'
import PageWrapper from '../components/PageWrapper'
import { SkeletonExpense } from '../components/Skeleton'
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

ChartJS.register(
  CategoryScale, LinearScale, PointElement,
  LineElement, ArcElement, Title, Tooltip, Legend, Filler
)

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD']

const GroupDetail = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const { darkMode } = useTheme()
  const navigate = useNavigate()

  const [group, setGroup] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [rates, setRates] = useState(null)
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [showMemberModal, setShowMemberModal] = useState(false)
  const [memberEmail, setMemberEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    description: '',
    amount: '',
    currency: 'USD',
    splitType: 'equal',
    customSplits: []
  })

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      const [groupRes, expenseRes, ratesRes] = await Promise.all([
        getGroupById(id),
        getExpensesByGroup(id),
        getRates()
      ])
      setGroup(groupRes.data)
      setExpenses(expenseRes.data)
      setRates(ratesRes.data.conversion_rates)
    } catch (err) {
      toast.error('Failed to fetch group data')
    } finally {
      setLoading(false)
    }
  }

  const convertAmount = (amount, fromCurrency, toCurrency) => {
    if (!rates || fromCurrency === toCurrency) return amount
    const inUSD = amount / rates[fromCurrency]
    return inUSD * rates[toCurrency]
  }

  const handleCreateExpense = async (e) => {
    e.preventDefault()
    try {
      await createExpense({
        groupId: id,
        description: form.description,
        amount: parseFloat(form.amount),
        currency: form.currency,
        splitType: form.splitType,
        customSplits: form.customSplits || []
      })
      const { data: updatedExpenses } = await getExpensesByGroup(id)
      setExpenses(updatedExpenses)
      setShowExpenseModal(false)
      setForm({ description: '', amount: '', currency: 'USD', splitType: 'equal', customSplits: [] })
      toast.success('Expense added!')
    } catch (err) {
      toast.error('Failed to create expense')
    }
  }

  const handleDeleteExpense = async (expenseId) => {
    try {
      await deleteExpense(expenseId)
      setExpenses(expenses.filter(e => e._id !== expenseId))
      toast.success('Expense deleted!')
    } catch (err) {
      toast.error('Failed to delete expense')
    }
  }

  const handleSettle = async (expenseId) => {
    try {
      const { data } = await settleExpense(expenseId)
      setExpenses(expenses.map(e => e._id === expenseId ? data : e))
      toast.success('Expense settled!')
    } catch (err) {
      toast.error('Failed to settle expense')
    }
  }

  const handleAddMember = async (e) => {
    e.preventDefault()
    try {
      const { data } = await addMember(id, memberEmail)
      setGroup(data)
      setShowMemberModal(false)
      setMemberEmail('')
      toast.success('Member added!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member')
    }
  }

  const getMyBalance = () => {
    if (!group || !rates) return { owed: 0, owing: 0, net: 0 }
    let owed = 0
    let owing = 0
    const baseCurrency = group.baseCurrency
    expenses.forEach(expense => {
      const isPayer = expense.paidBy._id === user._id
      expense.splits.forEach(split => {
        const isMe = split.user._id === user._id
        const convertedAmount = convertAmount(split.amount, expense.currency, baseCurrency)
        if (isPayer && !isMe && !split.settled) owed += convertedAmount
        if (!isPayer && isMe && !split.settled) owing += convertedAmount
      })
    })
    return {
      owed: owed.toFixed(2),
      owing: owing.toFixed(2),
      net: (owed - owing).toFixed(2)
    }
  }

  const getLineData = () => {
    if (!group || !rates) return { labels: [], datasets: [] }
    const dailyData = {}
    expenses.forEach(expense => {
      const date = new Date(expense.date).toLocaleDateString()
      const converted = convertAmount(expense.amount, expense.currency, group.baseCurrency)
      dailyData[date] = (dailyData[date] || 0) + converted
    })
    return {
      labels: Object.keys(dailyData),
      datasets: [{
        label: `Spending (${group.baseCurrency})`,
        data: Object.values(dailyData).map(v => parseFloat(v.toFixed(2))),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59,130,246,0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#3b82f6',
        pointRadius: 5,
        pointHoverRadius: 8
      }]
    }
  }

  const getDoughnutData = () => {
    if (!group || !rates) return { labels: [], datasets: [] }
    const memberTotals = {}
    expenses.forEach(expense => {
      const name = expense.paidBy.name
      const converted = convertAmount(expense.amount, expense.currency, group.baseCurrency)
      memberTotals[name] = (memberTotals[name] || 0) + converted
    })
    return {
      labels: Object.keys(memberTotals),
      datasets: [{
        data: Object.values(memberTotals).map(v => parseFloat(v.toFixed(2))),
        backgroundColor: ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'],
        borderWidth: 0,
        hoverOffset: 8
      }]
    }
  }

  if (loading) return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-6"></div>
        <div className="h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-8"></div>
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-xl h-24 animate-pulse"></div>
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => <SkeletonExpense key={i} />)}
        </div>
      </div>
    </PageWrapper>
  )

  if (!group) return (
    <PageWrapper>
      <div className="text-center py-12 text-gray-500">Group not found</div>
    </PageWrapper>
  )

  const balance = getMyBalance()

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.button
          whileHover={{ x: -4 }}
          onClick={() => navigate('/')}
          className="text-blue-600 hover:underline mb-4 flex items-center gap-1 text-sm"
        >
          ← Back to Dashboard
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex justify-between items-start mb-6"
        >
          <div>
            <h1 style={{ color: darkMode ? '#ffffff' : '#1f2937' }} className="text-3xl font-bold">{group.name}</h1>
            <p style={{ color: darkMode ? '#9ca3af' : '#6b7280' }} className="mt-1">{group.description}</p>
            <span className="text-xs text-gray-400 dark:text-gray-500">Balances shown in {group.baseCurrency}</span>
          </div>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowMemberModal(true)}
              className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition text-sm"
            >
              + Member
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowExpenseModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
            >
              + Expense
            </motion.button>
          </div>
        </motion.div>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>
        )}

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'You are owed', value: balance.owed, color: 'green' },
            { label: 'You owe', value: balance.owing, color: 'red' },
            { label: 'Net balance', value: balance.net, color: parseFloat(balance.net) >= 0 ? 'green' : 'red' }
          ].map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`${
                item.color === 'green'
                  ? 'bg-green-50 dark:bg-green-900'
                  : 'bg-red-50 dark:bg-red-900'
              } rounded-xl p-4 text-center`}
            >
              <p className="text-sm text-gray-500 dark:text-gray-300">{item.label}</p>
              <p className={`text-2xl font-bold ${
                item.color === 'green'
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {group.baseCurrency} {item.value}
              </p>
            </motion.div>
          ))}
        </div>

        {expenses.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
              <h3 className="text-md font-semibold text-gray-700 dark:text-gray-200 mb-3">
                Spending Trend ({group.baseCurrency})
              </h3>
              <Line
                data={getLineData()}
                options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
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
                }}
                height={160}
              />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
              <h3 className="text-md font-semibold text-gray-700 dark:text-gray-200 mb-3">
                Spending by Member ({group.baseCurrency})
              </h3>
              <Doughnut
                data={getDoughnutData()}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        color: darkMode ? '#9ca3af' : '#6b7280',
                        padding: 12,
                        font: { size: 11 }
                      }
                    }
                  },
                  cutout: '65%'
                }}
                height={160}
              />
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6"
        >
          <h3 className="text-md font-semibold text-gray-700 dark:text-gray-200 mb-3">
            Members ({group.members.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {group.members.map((member, index) => (
              <motion.div
                key={member._id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 rounded-full px-3 py-1"
              >
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-200">{member.name}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="space-y-3">
          <h3 className="text-md font-semibold text-gray-700 dark:text-gray-200">
            Expenses ({expenses.length})
          </h3>
          {expenses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <p className="text-4xl mb-2">🧾</p>
              <p className="text-gray-400">No expenses yet</p>
            </motion.div>
          ) : (
            <AnimatePresence>
              {expenses.map((expense, index) => (
                <motion.div
                  key={expense._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-white">{expense.description}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Paid by {expense.paidBy.name} · {expense.splitType} split
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800 dark:text-white">
                        {expense.currency} {expense.amount.toFixed(2)}
                      </p>
                      {expense.currency !== group.baseCurrency && rates && (
                        <p className="text-xs text-blue-500 mt-0.5">
                          ≈ {group.baseCurrency} {convertAmount(expense.amount, expense.currency, group.baseCurrency).toFixed(2)}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(expense.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1">
                    {expense.splits
                      .filter(split => split.user._id !== expense.paidBy._id)
                      .map(split => (
                        <div key={split._id} className="flex justify-between items-center text-sm">
                          <span className="text-gray-600 dark:text-gray-300">{split.user.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-700 dark:text-gray-200">
                              {expense.currency} {split.amount.toFixed(2)}
                            </span>
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                split.settled
                                  ? 'bg-green-100 text-green-600'
                                  : 'bg-yellow-100 text-yellow-600'
                              }`}
                            >
                              {split.settled ? 'Settled' : 'Pending'}
                            </motion.span>
                          </div>
                        </div>
                      ))
                    }
                  </div>

                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    {expense.paidBy._id !== user._id && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSettle(expense._id)}
                        className="text-sm text-green-600 hover:underline"
                      >
                        Mark as settled
                      </motion.button>
                    )}
                    {expense.paidBy._id === user._id && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeleteExpense(expense._id)}
                        className="text-sm text-red-500 hover:underline ml-auto"
                      >
                        Delete
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {showExpenseModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4 max-h-screen overflow-y-auto"
            >
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Add Expense</h2>
              <form onSubmit={handleCreateExpense} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Dinner, Hotel, etc."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Currency</label>
                  <select
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {CURRENCIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Split Type</label>
                  <select
                    value={form.splitType}
                    onChange={(e) => setForm({ ...form, splitType: e.target.value, customSplits: [] })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="equal">Equal</option>
                    <option value="percentage">Percentage</option>
                    <option value="custom">Custom Amount</option>
                  </select>
                </div>

                {form.splitType === 'percentage' && group && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Percentage per member (must add up to 100)
                    </label>
                    <div className="space-y-2">
                      {group.members.map((member) => (
                        <div key={member._id} className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{member.name}</span>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="0"
                            value={form.customSplits?.find(s => s.user === member._id)?.percentage || ''}
                            onChange={(e) => {
                              const existing = form.customSplits || []
                              const updated = existing.filter(s => s.user !== member._id)
                              updated.push({ user: member._id, percentage: parseFloat(e.target.value) || 0 })
                              setForm({ ...form, customSplits: updated })
                            }}
                            className="w-20 border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-500">%</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Total: {(form.customSplits || []).reduce((sum, s) => sum + (s.percentage || 0), 0)}%
                    </p>
                  </div>
                )}

                {form.splitType === 'custom' && group && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Custom amount per member
                    </label>
                    <div className="space-y-2">
                      {group.members.map((member) => (
                        <div key={member._id} className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{member.name}</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            value={form.customSplits?.find(s => s.user === member._id)?.amount || ''}
                            onChange={(e) => {
                              const existing = form.customSplits || []
                              const updated = existing.filter(s => s.user !== member._id)
                              updated.push({ user: member._id, amount: parseFloat(e.target.value) || 0 })
                              setForm({ ...form, customSplits: updated })
                            }}
                            className="w-24 border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-500">{form.currency}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Total assigned: {form.currency} {(form.customSplits || []).reduce((sum, s) => sum + (s.amount || 0), 0).toFixed(2)}
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowExpenseModal(false)
                      setForm({ description: '', amount: '', currency: 'USD', splitType: 'equal', customSplits: [] })
                    }}
                    className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    Add Expense
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {showMemberModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4"
            >
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Add Member</h2>
              <form onSubmit={handleAddMember} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Member Email</label>
                  <input
                    type="email"
                    value={memberEmail}
                    onChange={(e) => setMemberEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="friend@example.com"
                    required
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowMemberModal(false)}
                    className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    Add Member
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </div>
    </PageWrapper>
  )
}

export default GroupDetail