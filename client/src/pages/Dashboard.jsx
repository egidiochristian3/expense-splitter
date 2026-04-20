import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getGroups, createGroup, deleteGroup } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { toast } from 'react-toastify'
import PageWrapper from '../components/PageWrapper'
import { SkeletonCard } from '../components/Skeleton'
import { MdDelete } from 'react-icons/md'

const Dashboard = () => {
  const [groups, setGroups] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', baseCurrency: 'USD' })
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { darkMode } = useTheme()
  const navigate = useNavigate()

  const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD']

  useEffect(() => {
    fetchGroups()
  }, [])

  const fetchGroups = async () => {
    try {
      const { data } = await getGroups()
      setGroups(data)
    } catch (err) {
      toast.error('Failed to fetch groups')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateGroup = async (e) => {
    e.preventDefault()
    try {
      await createGroup(form)
      const { data: updatedGroups } = await getGroups()
      setGroups(updatedGroups)
      setShowModal(false)
      setForm({ name: '', description: '', baseCurrency: 'USD' })
      toast.success('Group created successfully!')
    } catch (err) {
      toast.error('Failed to create group')
    }
  }

  const handleDeleteGroup = async (e, groupId) => {
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to delete this group? This cannot be undone.')) return
    try {
      await deleteGroup(groupId)
      setGroups(groups.filter(g => g._id !== groupId))
      toast.success('Group deleted!')
    } catch (err) {
      toast.error('Failed to delete group. Only the group creator can delete it.')
    }
  }

  return (
    <PageWrapper>
      <div className="min-h-screen relative overflow-hidden">

        <style>{`
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          @keyframes floatBubble {
            0% { transform: translateY(0px) scale(1); opacity: 0.15; }
            50% { transform: translateY(-30px) scale(1.05); opacity: 0.25; }
            100% { transform: translateY(0px) scale(1); opacity: 0.15; }
          }
          .animated-bg {
            background: ${darkMode
              ? 'linear-gradient(-45deg, #0f172a, #1e1b4b, #0f172a, #1e3a5f)'
              : 'linear-gradient(-45deg, #eff6ff, #eef2ff, #f0fdf4, #eff6ff)'
            };
            background-size: 400% 400%;
            animation: gradientShift 12s ease infinite;
          }
          .bubble { animation: floatBubble ease-in-out infinite; }
        `}</style>

        <div className="animated-bg absolute inset-0" style={{ zIndex: 0 }}></div>

        <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 0 }}>
          <div className="bubble absolute w-96 h-96 rounded-full bg-blue-400 dark:bg-blue-800 -top-20 -left-20" style={{ animationDuration: '8s', opacity: 0.15 }}></div>
          <div className="bubble absolute w-80 h-80 rounded-full bg-indigo-400 dark:bg-indigo-800 top-1/3 -right-20" style={{ animationDuration: '10s', animationDelay: '2s', opacity: 0.15 }}></div>
          <div className="bubble absolute w-64 h-64 rounded-full bg-purple-400 dark:bg-purple-800 bottom-20 left-1/4" style={{ animationDuration: '7s', animationDelay: '1s', opacity: 0.15 }}></div>
          <div className="bubble absolute w-48 h-48 rounded-full bg-cyan-400 dark:bg-cyan-800 top-20 right-1/3" style={{ animationDuration: '9s', animationDelay: '3s', opacity: 0.10 }}></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8" style={{ position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex justify-between items-center mb-8"
          >
            <div>
              <h1 style={{ color: darkMode ? '#ffffff' : '#1f2937' }} className="text-3xl font-bold">My Groups</h1>
              <p style={{ color: darkMode ? '#9ca3af' : '#6b7280' }} className="mt-1">Welcome back, {user?.name}!</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition font-medium shadow-md"
            >
              + New Group
            </motion.button>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : groups.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-5xl mb-4">👥</p>
              <p className="text-gray-400 text-lg">No groups yet</p>
              <p className="text-gray-400 text-sm mt-1">Create a group to start splitting expenses</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groups.map((group, index) => (
                <motion.div
                  key={group._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{
                    scale: 1.03,
                    boxShadow: darkMode
                      ? '0 10px 30px rgba(0,0,0,0.4)'
                      : '0 10px 30px rgba(59,130,246,0.15)'
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/groups/${group._id}`)}
               className="rounded-xl p-6 cursor-pointer transition-colors"
style={{
  background: 'rgba(255,255,255,0.07)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.12)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.15)'
}}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 style={{ color: darkMode ? '#ffffff' : '#1f2937' }} className="text-lg font-semibold">{group.name}</h3>
                      <p style={{ color: darkMode ? '#9ca3af' : '#6b7280' }} className="text-sm mt-1">{group.description}</p>
                    </div>
                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-medium px-2 py-1 rounded-full">
                      {group.baseCurrency}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {group.members.slice(0, 3).map(member => (
                          <div
                            key={member._id}
                            className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-gray-800"
                          >
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                        ))}
                      </div>
                      <span className="text-gray-500 dark:text-gray-400 text-sm">
                        {group.members.length} member{group.members.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => handleDeleteGroup(e, group._id)}
                      className="text-red-400 hover:text-red-600 transition-colors p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900"
                      title="Delete group"
                    >
                      <MdDelete size={18} />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {showModal && (
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
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Create New Group</h2>
                <form onSubmit={handleCreateGroup} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Group Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Trip to Paris"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                    <input
                      type="text"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Optional description"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Base Currency</label>
                    <select
                      value={form.baseCurrency}
                      onChange={(e) => setForm({ ...form, baseCurrency: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {CURRENCIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
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
                      Create
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}

export default Dashboard