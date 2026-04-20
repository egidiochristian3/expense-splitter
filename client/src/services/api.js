import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:5000/api'
})

API.interceptors.request.use((req) => {
  const user = localStorage.getItem('user')
  if (user) {
    req.headers.Authorization = `Bearer ${JSON.parse(user).token}`
  }
  return req
})

export const getGroups = () => API.get('/groups')
export const getGroupById = (id) => API.get(`/groups/${id}`)
export const createGroup = (data) => API.post('/groups', data)
export const addMember = (id, email) => API.post(`/groups/${id}/members`, { email })
export const deleteGroup = (id) => API.delete(`/groups/${id}`)

export const getExpensesByGroup = (groupId) => API.get(`/expenses/group/${groupId}`)
export const createExpense = (data) => API.post('/expenses', data)
export const updateExpense = (id, data) => API.put(`/expenses/${id}`, data)
export const deleteExpense = (id) => API.delete(`/expenses/${id}`)
export const settleExpense = (id) => API.put(`/expenses/${id}/settle`)

export const getRates = () => API.get('/currency/rates')
export const convertCurrency = (data) => API.post('/currency/convert', data)

export default API