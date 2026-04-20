import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useAuth } from './context/AuthContext'
import { useTheme } from './context/ThemeContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import GroupDetail from './pages/GroupDetail'
import Analytics from './pages/AnalyticsPage'
import Profile from './pages/Profile'
import SettlementHistory from './pages/SettlementHistory'
import Search from './pages/Search'
import Landing from './pages/Landing'
import Navbar from './components/Navbar'

function App() {
  const { user } = useAuth()
  const { darkMode } = useTheme()
  const location = useLocation()

  const isDashboard = location.pathname === '/'
  const isLanding = location.pathname === '/landing'

  return (
    <div className={`min-h-screen ${isDashboard || isLanding ? '' : darkMode ? 'bg-gray-950' : 'bg-gray-100'}`}>
      {user && !isLanding && <Navbar />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/landing" element={<Landing />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
          <Route path="/" element={user ? <Dashboard /> : <Navigate to="/landing" />} />
          <Route path="/groups/:id" element={user ? <GroupDetail /> : <Navigate to="/landing" />} />
          <Route path="/analytics" element={user ? <Analytics /> : <Navigate to="/landing" />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/landing" />} />
          <Route path="/history" element={user ? <SettlementHistory /> : <Navigate to="/landing" />} />
          <Route path="/search" element={user ? <Search /> : <Navigate to="/landing" />} />
        </Routes>
      </AnimatePresence>
    </div>
  )
}

export default App