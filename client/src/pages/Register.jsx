import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'

const floatingItems = ['💸', '💰', '🧾', '💳', '🪙', '💵', '📊', '💹']
const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD']

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    defaultCurrency: 'USD'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [particles, setParticles] = useState([])
  const [success, setSuccess] = useState(false)
  const { register } = useAuth()
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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form.name, form.email, form.password, form.defaultCurrency)
      setSuccess(true)
      toast.success('Account created successfully!')
      setTimeout(() => navigate('/'), 1500)
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-700 to-blue-800 relative overflow-hidden">

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
        @keyframes successPop {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes successFade {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
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
        .success-pop {
          animation: successPop 0.5s ease forwards;
        }
        .success-fade {
          animation: successFade 0.5s ease forwards 0.3s both;
        }
        .input-glow:focus {
          box-shadow: 0 0 0 3px rgba(255,255,255,0.2);
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
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full opacity-20"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500 rounded-full opacity-20"></div>
        <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-blue-400 rounded-full opacity-10"></div>
        <div className="absolute bottom-1/3 left-1/3 w-32 h-32 bg-purple-300 rounded-full opacity-10"></div>
      </div>

      <div className="relative z-10 w-full max-w-md mx-4 fade-in-up">

        <div className="text-center mb-6">
          <div className="relative inline-block">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-2xl">
              <span style={{ fontSize: '40px' }}>💳</span>
            </div>
            <div className="absolute inset-0 w-20 h-20 bg-white rounded-2xl mx-auto pulse-ring"></div>
          </div>
          <h1 className="text-4xl font-bold text-white mt-4">SplitEase</h1>
          <p className="text-purple-200 mt-1">Split expenses, not friendships</p>
        </div>

        {success ? (
          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-10 border border-white border-opacity-20 shadow-2xl text-center">
            <div className="success-pop text-6xl mb-4">🎉</div>
            <h2 className="success-fade text-2xl font-bold text-white mb-2">You're all set!</h2>
            <p className="success-fade text-purple-200">Redirecting to dashboard...</p>
            <div className="mt-4 flex justify-center gap-1">
              {[0,1,2].map(i => (
                <div
                  key={i}
                  className="w-2 h-2 bg-white rounded-full opacity-60"
                  style={{ animation: `pulse-ring 1s ease-in-out ${i * 0.2}s infinite` }}
                ></div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-8 border border-white border-opacity-20 shadow-2xl">
            <h2 className="text-2xl font-bold text-white text-center mb-6">Create Account</h2>

            {error && (
              <div className="bg-red-500 bg-opacity-20 border border-red-400 text-red-200 p-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-purple-100 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="login-input input-glow w-full bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg px-4 py-3 text-white placeholder-purple-200 focus:outline-none transition"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-100 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="login-input input-glow w-full bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg px-4 py-3 text-white placeholder-purple-200 focus:outline-none transition"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-100 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="login-input input-glow w-full bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg px-4 py-3 text-white placeholder-purple-200 focus:outline-none transition"
                  placeholder="Min. 6 characters"
                  required
                />
                <div className="mt-1 flex gap-1">
                  {[1,2,3,4].map(i => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        form.password.length === 0 ? 'bg-white bg-opacity-20' :
                        form.password.length < 4 && i <= 1 ? 'bg-red-400' :
                        form.password.length < 6 && i <= 2 ? 'bg-yellow-400' :
                        form.password.length < 8 && i <= 3 ? 'bg-blue-400' :
                        form.password.length >= 8 && i <= 4 ? 'bg-green-400' :
                        'bg-white bg-opacity-20'
                      }`}
                    ></div>
                  ))}
                </div>
                <p className="text-xs text-purple-300 mt-1">
                  {form.password.length === 0 ? 'Enter a password' :
                   form.password.length < 4 ? 'Too weak' :
                   form.password.length < 6 ? 'Getting stronger' :
                   form.password.length < 8 ? 'Good password' :
                   'Strong password!'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-100 mb-1">Default Currency</label>
                <select
                  name="defaultCurrency"
                  value={form.defaultCurrency}
                  onChange={handleChange}
                  className="login-input input-glow w-full bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg px-4 py-3 text-white focus:outline-none transition"
                >
                  {CURRENCIES.map(c => (
                    <option key={c} value={c} style={{ color: '#1f2937' }}>{c}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-purple-700 py-3 rounded-lg hover:bg-purple-50 transition font-bold text-lg shadow-lg disabled:opacity-50 mt-2"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-sm text-purple-200 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-white font-bold hover:underline">
                Login
              </Link>
            </p>
          </div>
        )}

        <p className="text-center text-purple-300 text-xs mt-6">
          Secure · Fast · Multi-currency
        </p>
      </div>
    </div>
  )
}

export default Register