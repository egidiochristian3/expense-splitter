import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import socket from '../socket'
import {
  MdDashboard,
  MdAnalytics,
  MdHistory,
  MdSearch,
  MdNotifications,
  MdPerson,
  MdLogout,
  MdDarkMode,
  MdLightMode,
  MdSettings
} from 'react-icons/md'

const Navbar = () => {
  const { user, logout } = useAuth()
  const { darkMode, toggleDarkMode } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const dropdownRef = useRef(null)
  const notifRef = useRef(null)

  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    socket.on('notification', (notif) => {
      setNotifications(prev => [notif, ...prev])
    })
    return () => socket.off('notification')
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  const isActive = (path) => location.pathname === path

  const navLinks = [
    { path: '/', label: 'Dashboard', icon: MdDashboard },
    { path: '/analytics', label: 'Analytics', icon: MdAnalytics },
    { path: '/history', label: 'History', icon: MdHistory },
    { path: '/search', label: 'Search', icon: MdSearch },
  ]

  return (
    <>
      <style>{`
        @keyframes logoSpin {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(10deg) scale(1.1); }
          100% { transform: rotate(0deg) scale(1); }
        }
        @keyframes slideDown {
          0% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes bellRing {
          0% { transform: rotate(0deg); }
          10% { transform: rotate(15deg); }
          20% { transform: rotate(-15deg); }
          30% { transform: rotate(10deg); }
          40% { transform: rotate(-10deg); }
          50% { transform: rotate(0deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes badgePop {
          0% { transform: scale(0); }
          70% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        .logo-hover:hover { animation: logoSpin 0.5s ease; }
        .dropdown-menu { animation: slideDown 0.2s ease forwards; }
        .bell-ring { animation: bellRing 3s ease infinite; }
        .badge-pop { animation: badgePop 0.3s ease forwards; }
        .active-indicator {
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 2px;
          background: #3b82f6;
          border-radius: 2px;
        }
        .nav-link { position: relative; padding-bottom: 4px; }
      `}</style>

      <nav className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700'
          : 'bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700'
      }`}>
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">

          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-md logo-hover cursor-pointer transition-transform">
                <span style={{ fontSize: '18px' }}>💸</span>
              </div>
              <span className="text-xl font-bold text-blue-600 hidden sm:block">SplitEase</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(link => {
                const Icon = link.icon
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`nav-link px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive(link.path)
                        ? 'text-blue-600 bg-blue-50 dark:bg-blue-900 dark:text-blue-300'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon size={16} />
                    {link.label}
                    {isActive(link.path) && <div className="active-indicator"></div>}
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={toggleDarkMode}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all hover:scale-110"
              title="Toggle dark mode"
            >
              {darkMode
                ? <MdLightMode size={18} className="text-yellow-400" />
                : <MdDarkMode size={18} className="text-gray-600" />
              }
            </button>

            <div className="relative" ref={notifRef}>
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications)
                  setShowDropdown(false)
                }}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all hover:scale-110 relative"
                title="Notifications"
              >
                <MdNotifications
                  size={18}
                  className={`text-gray-600 dark:text-gray-300 ${unreadCount > 0 ? 'bell-ring' : ''}`}
                />
                {unreadCount > 0 && (
                  <span className="badge-pop absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="dropdown-menu absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                  <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                    <span className="font-semibold text-gray-800 dark:text-white text-sm">Notifications</span>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-xs text-blue-600 hover:underline">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-gray-400 text-sm">
                        No notifications yet
                      </div>
                    ) : notifications.map(notif => (
                      <div
                        key={notif.id}
                        onClick={() => setNotifications(notifications.map(n =>
                          n.id === notif.id ? { ...n, read: true } : n
                        ))}
                        className={`px-4 py-3 border-b border-gray-50 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                          !notif.read ? 'bg-blue-50 dark:bg-blue-900' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                            !notif.read ? 'bg-blue-500' : 'bg-gray-300'
                          }`}></div>
                          <div>
                            <p className="text-sm text-gray-700 dark:text-gray-200">{notif.text}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{notif.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => {
                  setShowDropdown(!showDropdown)
                  setShowNotifications(false)
                }}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-200 font-medium hidden sm:block">
                  {user?.name.split(' ')[0]}
                </span>
                <span className="text-gray-400 text-xs">{showDropdown ? '▲' : '▼'}</span>
              </button>

              {showDropdown && (
                <div className="dropdown-menu absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                    <p className="font-semibold text-gray-800 dark:text-white text-sm">{user?.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => { navigate('/profile'); setShowDropdown(false) }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                      <MdPerson size={16} className="text-gray-500" /> Profile
                    </button>
                    <button
                      onClick={() => { navigate('/analytics'); setShowDropdown(false) }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                      <MdAnalytics size={16} className="text-gray-500" /> Analytics
                    </button>
                    <button
                      onClick={() => { navigate('/history'); setShowDropdown(false) }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                      <MdHistory size={16} className="text-gray-500" /> History
                    </button>
                    <button
                      onClick={toggleDarkMode}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                      {darkMode
                        ? <MdLightMode size={16} className="text-yellow-400" />
                        : <MdDarkMode size={16} className="text-gray-500" />
                      }
                      {darkMode ? 'Light Mode' : 'Dark Mode'}
                    </button>
                    <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900 transition-colors flex items-center gap-2"
                    >
                      <MdLogout size={16} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}

export default Navbar