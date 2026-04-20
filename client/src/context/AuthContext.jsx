import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import socket from '../socket'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      setUser(parsedUser)
      axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`
      socket.connect()
      socket.emit('join', parsedUser._id)
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const { data } = await axios.post('http://localhost:5000/api/auth/login', {
      email,
      password
    })
    setUser(data)
    localStorage.setItem('user', JSON.stringify(data))
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
    socket.connect()
    socket.emit('join', data._id)
    return data
  }

  const register = async (name, email, password, defaultCurrency) => {
    const { data } = await axios.post('http://localhost:5000/api/auth/register', {
      name,
      email,
      password,
      defaultCurrency
    })
    setUser(data)
    localStorage.setItem('user', JSON.stringify(data))
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
    socket.connect()
    socket.emit('join', data._id)
    return data
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    delete axios.defaults.headers.common['Authorization']
    socket.disconnect()
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}