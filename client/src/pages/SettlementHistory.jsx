import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { getGroups, getExpensesByGroup } from '../services/api'
import PageWrapper from '../components/PageWrapper'
import { useAuth } from '../context/AuthContext'
import { MdReceipt, MdAttachMoney, MdCalendarToday } from 'react-icons/md'

const SettlementHistory = () => {
  const { darkMode } = useTheme()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [settled, setSettled] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const { data: groups } = await getGroups()
      const allSettled = []
      await Promise.all(groups.map(async (group) => {
        const { data: expenses } = await getExpensesByGroup(group._id)
        expenses.forEach(expense => {
          expense.splits.forEach(split => {
            if (split.settled) {
              allSettled.push({
                ...split,
                expenseDescription: expense.description,
                expenseAmount: expense.amount,
                currency: expense.currency,
                paidBy: expense.paidBy,
                groupName: group.name,
                groupId: group._id,
                date: expense.date
              })
            }
          })
        })
      }))
      allSettled.sort((a, b) => new Date(b.date) - new Date(a.date))
      setSettled(allSettled)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = settled.filter(s => {
    if (filter === 'paid') return s.user._id === user._id
    if (filter === 'received') return s.paidBy._id === user._id
    return true
  })

  const totalSettled = filtered.reduce((sum, s) => sum + s.amount, 0)

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 style={{ color: darkMode ? '#ffffff' : '#1f2937' }} className="text-3xl font-bold mb-1">Settlement History</h1>
          <p style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>All your settled expenses</p>
        </motion.div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
           { label: 'Total Settlements', value: filtered.length, icon: MdReceipt, color: '#3b82f6' },
{ label: 'Total Amount', value: `$${totalSettled.toFixed(2)}`, icon: MdAttachMoney, color: '#10b981' },
{ label: 'This Month', value: filtered.filter(s => new Date(s.date).getMonth() === new Date().getMonth()).length, icon: MdCalendarToday, color: '#8b5cf6' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm border border-gray-100 dark:border-gray-700"
            >
              <stat.icon size={28} style={{ color: stat.color }} className="mx-auto mb-1" />
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stat.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="flex gap-2 mb-6">
          {['all', 'paid', 'received'].map(f => (
            <motion.button
              key={f}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
              }`}
            >
              {f === 'all' ? 'All' : f === 'paid' ? 'I Paid' : 'I Received'}
            </motion.button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 animate-pulse border border-gray-100 dark:border-gray-700">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-5xl mb-4">✅</p>
            <p style={{ color: darkMode ? '#9ca3af' : '#6b7280' }} className="text-lg">No settlements yet</p>
          </motion.div>
        ) : (
          <AnimatePresence>
            {filtered.map((settlement, index) => (
              <motion.div
                key={`${settlement._id}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate(`/groups/${settlement.groupId}`)}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700 mb-3 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">✅</span>
                      <h4 className="font-semibold text-gray-800 dark:text-white">{settlement.expenseDescription}</h4>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {settlement.user.name} settled with {settlement.paidBy.name}
                    </p>
                    <span className="inline-block mt-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                      {settlement.groupName}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600 dark:text-green-400">
                      {settlement.currency} {settlement.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(settlement.date).toLocaleDateString()}
                    </p>
                    <span className="inline-block mt-1 text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                      Settled
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </PageWrapper>
  )
}

export default SettlementHistory