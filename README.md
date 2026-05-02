# 💸 SplitEase — Multi-Currency Expense Splitter

A full-stack web application that helps groups track, split, and settle shared expenses across multiple currencies in real time.

![Stack](https://img.shields.io/badge/Stack-MERN-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18-339933?style=for-the-badge&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Local-47A248?style=for-the-badge&logo=mongodb)

---

##  Features

- **User Authentication** — Secure register/login with JWT and bcrypt password hashing
- **Group Management** — Create groups, invite members by email, delete groups
- **Multi-Currency Expenses** — Add expenses in any currency with live exchange rate conversion
- **Flexible Split Modes** — Equal, percentage, or custom amount splits
- **Real-Time Notifications** — Instant settlement notifications via Socket.io
- **Analytics Dashboard** — Spending trends, member breakdowns, and group comparisons
- **Settlement History** — Full history of all settled expenses across groups
- **Search** — Search expenses across all groups simultaneously
- **Profile Management** — Edit personal info and change password
- **Dark Mode** — Full dark mode with localStorage persistence
- **Animated UI** — Page transitions, skeleton loaders, and hover effects via Framer Motion
- **Landing Page** — Stunning animated landing page with glassmorphism effects

---

##  Tech Stack

### Frontend

- **React + Vite** — UI framework and build tool
- **Tailwind CSS** — Utility-first styling
- **Framer Motion** — Page transitions and animations
- **Chart.js + react-chartjs-2** — Line and Doughnut charts
- **React Router DOM** — Client-side navigation
- **Axios** — HTTP requests to backend
- **Socket.io-client** — Real-time notifications
- **react-toastify** — Toast notifications
- **react-icons** — Professional Material icons

### Backend

- **Node.js + Express** — REST API server
- **MongoDB + Mongoose** — Database and ODM
- **JWT (jsonwebtoken)** — Authentication tokens
- **bcryptjs** — Password hashing
- **Socket.io** — WebSocket real-time communication
- **express-validator** — Input validation
- **axios** — ExchangeRate API calls
- **dotenv** — Environment variable management
- **nodemon** — Development auto-restart

---

## 📁 Project Structure
expense-splitter/
├── client/
│   └── src/
│       ├── components/      # Navbar, PageWrapper, Skeleton
│       ├── context/         # AuthContext, ThemeContext
│       ├── pages/           # Login, Register, Dashboard, GroupDetail,
│       │                      Analytics, Profile, History, Search, Landing
│       ├── services/        # api.js (Axios instance)
│       └── socket.js        # Socket.io client
│
└── server/
└── src/
├── controllers/     # auth, group, expense, currency
├── middleware/       # auth.middleware.js
├── models/          # User, Group, Expense models
├── routes/          # auth, group, expense, currency routes
├── utils/           # splitCalculator.js
├── socket.js        # Socket.io server
├── app.js           # Express app setup
└── server.js        # Entry point

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local via MongoDB Compass)
- ExchangeRate API key — free at [exchangerate-api.com](https://exchangerate-api.com)
- Git Bash (recommended terminal on Windows)

### 1. Clone the repository

```bash
git clone https://github.com/egidiochristian3/expense-splitter.git
cd expense-splitter
```

### 2. Set up the backend

```bash
cd server
npm install
```

Create a `.env` file inside the `server/` folder:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/expense-splitter
JWT_SECRET=your_jwt_secret_here
EXCHANGE_API_KEY=your_exchangerate_api_key_here
```

Start the server:

```bash
npm run dev
```

You should see:
Connected to MongoDB
Server running on port 5000

### 3. Set up the frontend

Open a second terminal:

```bash
cd client
npm install
npm run dev
```

### 4. Open the app

Go to `http://localhost:5173` in your browser.

---

## 🔑 API Endpoints

### Authentication

- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login user
- `GET /api/auth/me` — Get current user (protected)
- `PUT /api/auth/profile` — Update profile (protected)
- `PUT /api/auth/password` — Change password (protected)

### Groups

- `GET /api/groups` — Get all user groups (protected)
- `POST /api/groups` — Create new group (protected)
- `GET /api/groups/:id` — Get group by ID (protected)
- `POST /api/groups/:id/members` — Add member by email (protected)
- `DELETE /api/groups/:id` — Delete group (protected)

### Expenses

- `POST /api/expenses` — Create expense (protected)
- `GET /api/expenses/group/:groupId` — Get group expenses (protected)
- `PUT /api/expenses/:id` — Update expense (protected)
- `DELETE /api/expenses/:id` — Delete expense (protected)
- `PUT /api/expenses/:id/settle` — Settle expense (protected)

### Currency

- `GET /api/currency/rates` — Get live exchange rates (protected)
- `POST /api/currency/convert` — Convert between currencies (protected)

---

## 🗄️ Database Schema

### User
```json
{
  "name": "String (required)",
  "email": "String (unique, required)",
  "password": "String (bcrypt hashed)",
  "defaultCurrency": "String (default: USD)"
}
```

### Group
```json
{
  "name": "String (required)",
  "description": "String",
  "baseCurrency": "String (default: USD)",
  "createdBy": "ObjectId (ref: User)",
  "members": "[ObjectId] (ref: User)"
}
```

### Expense
```json
{
  "group": "ObjectId (ref: Group)",
  "paidBy": "ObjectId (ref: User)",
  "description": "String (required)",
  "amount": "Number (required)",
  "currency": "String (required)",
  "splitType": "equal | percentage | custom",
  "splits": [{
    "user": "ObjectId (ref: User)",
    "amount": "Number",
    "currency": "String",
    "settled": "Boolean (default: false)"
  }],
  "date": "Date (default: now)"
}
```

---

## ⚡ Real-Time Architecture
User A settles expense
↓
Frontend calls PUT /api/expenses/:id/settle
↓
auth.middleware.js verifies JWT token
↓
expense.controller.js marks split as settled
↓
Socket.io emits notification to payer's room
↓
User B's Navbar receives event instantly
↓
Bell badge updates with new notification

---

## 🌍 Currency Conversion

- Powered by ExchangeRate-API (free tier)
- Supports **170+ currencies**
- **1-hour caching** to stay within API rate limits
- Conversion formula: `amount / rates[from] * rates[to]`
- All balances shown in the group's base currency

---

## 📱 Pages

- `/landing` — Animated landing page with glassmorphism
- `/login` — Animated login with floating emojis
- `/register` — Register with password strength indicator
- `/` — Dashboard with animated background and group cards
- `/groups/:id` — Group detail with expenses, balances, charts
- `/analytics` — Spending insights and charts
- `/profile` — Edit personal info and change password
- `/history` — Settlement history with filters
- `/search` — Search expenses across all groups

---

## 🔒 Security

- Passwords hashed with **bcryptjs** (10 salt rounds)
- JWT tokens expire after **30 days**
- All private routes protected by **auth middleware**
- Environment variables stored in `.env` (never committed to Git)
- Input validation via **express-validator**

---

## 👨‍💻 Author

**Christian Egidio**
GitHub: [@egidiochristian3](https://github.com/egidiochristian3)

---

## 📄 License

This project was built as an academic submission for a Full-Stack Web Development course.

---

CODE EXPLANATION VIDEO (https://drive.google.com/file/d/1S6A24fZ6kN7XmEh5gbGmLF20aF9o8mof/view?usp=sharing)
PROJECT OVERVIEW VIDEO (https://drive.google.com/file/d/1CVQ8TW4aQRKayD0PcKg3pnMj625eUT2x/view?usp=drive_link)
