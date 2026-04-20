import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'

const floatingItems = ['💸', '💰', '🧾', '💳', '🪙', '💵', '📊', '💹']

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [particles, setParticles] = useState([])
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const generated = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      emoji: floatingItems[Math.floor(Math.random() * floatingItems.length)],
      left: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 6 + Math.random() * 8,
      size: 16 + Math.random() * 20
    }))
    setParticles(generated)
  }, [])

  const handleSubmit = async (e) => {
  e.preventDefault()
  setError('')
  setLoading(true)
  try {
    await login(email, password)
    toast.success('Welcome back!')
    navigate('/')
  } catch (err) {
    const msg = err.response?.data?.message || 'Login failed'
    setError(msg)
    toast.error(msg)
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">

      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100px) rotate(360deg); opacity: 0; }
        }
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        .float-particle {
          position: absolute;
          animation: floatUp linear infinite;
          pointer-events: none;
          user-select: none;
        }
        .fade-in-up {
          animation: fadeInUp 0.6s ease forwards;
        }
        .pulse-ring {
          animation: pulse-ring 2s ease-out infinite;
        }
      `}</style>

      {particles.map(p => (
        <div
          key={p.id}
          className="float-particle"
          style={{
            left: `${p.left}%`,
            bottom: '-50px',
            fontSize: `${p.size}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`
          }}
        >
          {p.emoji}
        </div>
      ))}

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full opacity-20"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500 rounded-full opacity-20"></div>
        <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-blue-400 rounded-full opacity-10"></div>
      </div>

      <div className="relative z-10 w-full max-w-md mx-4 fade-in-up">
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-2xl">
              <span style={{ fontSize: '40px' }}>💸</span>
            </div>
            <div className="absolute inset-0 w-20 h-20 bg-white rounded-2xl mx-auto pulse-ring"></div>
          </div>
          <h1 className="text-4xl font-bold text-white mt-4">SplitEase</h1>
          <p className="text-blue-200 mt-1">Split expenses, not friendships</p>
        </div>

        <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-8 border border-white border-opacity-20 shadow-2xl">
          <h2 className="text-2xl font-bold text-white text-center mb-6">Welcome Back</h2>

          {error && (
            <div className="bg-red-500 bg-opacity-20 border border-red-400 text-red-200 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-blue-100 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="login-input w-full bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg px-4 py-3 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-100 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input w-full bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg px-4 py-3 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-blue-700 py-3 rounded-lg hover:bg-blue-50 transition font-bold text-lg shadow-lg disabled:opacity-50 mt-2"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-center text-sm text-blue-200 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-white font-bold hover:underline">
              Register
            </Link>
          </p>
        </div>

        <p className="text-center text-blue-300 text-xs mt-6">
          Secure · Fast · Multi-currency
        </p>
      </div>
    </div>
  )
}

export default Login