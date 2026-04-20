import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { getGroups, getExpensesByGroup } from '../services/api'
import PageWrapper from '../components/PageWrapper'

const Search = () => {
  const { darkMode } = useTheme()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setSearched(true)
    try {
      const { data: groups } = await getGroups()
      const allExpenses = []
      await Promise.all(groups.map(async (group) => {
        const { data: expenses } = await getExpensesByGroup(group._id)
        expenses.forEach(expense => {
          if (
            expense.description.toLowerCase().includes(query.toLowerCase()) ||
            expense.currency.toLowerCase().includes(query.toLowerCase()) ||
            expense.paidBy.name.toLowerCase().includes(query.toLowerCase())
          ) {
            allExpenses.push({ ...expense, groupName: group.name, groupId: group._id })
          }
        })
      }))
      setResults(allExpenses)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 style={{ color: darkMode ? '#ffffff' : '#1f2937' }} className="text-3xl font-bold mb-1">Search</h1>
          <p style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>Find expenses across all your groups</p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSearch}
          className="flex gap-3 mb-8"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by description, currency, or member name..."
            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white text-gray-800 bg-white shadow-sm"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition font-medium shadow-md"
          >
            Search
          </motion.button>
        </motion.form>

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 animate-pulse border border-gray-100 dark:border-gray-700">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-5xl mb-4">🔍</p>
            <p style={{ color: darkMode ? '#9ca3af' : '#6b7280' }} className="text-lg">No results found for "{query}"</p>
          </motion.div>
        )}

        <AnimatePresence>
          {!loading && results.map((expense, index) => (
            <motion.div
              key={expense._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(`/groups/${expense.groupId}`)}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700 mb-3 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-white">{expense.description}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Paid by {expense.paidBy.name} · {expense.splitType} split
                  </p>
                  <span className="inline-block mt-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                    {expense.groupName}
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800 dark:text-white">
                    {expense.currency} {expense.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(expense.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </PageWrapper>
  )
}

export default Search