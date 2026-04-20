const http = require('http')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const app = require('./app')
const { initSocket } = require('./socket')

dotenv.config()

const PORT = process.env.PORT || 5000
const MONGO_URI = process.env.MONGO_URI

const server = http.createServer(app)

initSocket(server)

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB')
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err)
    process.exit(1)
  })