import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'

const PageWrapper = ({ children }) => {
  const { darkMode } = useTheme()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="min-h-screen relative overflow-hidden"
    >
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

      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </motion.div>
  )
}

export default PageWrapper