# Expense Tracker Web Application

A full-stack web application built with the MERN stack (MongoDB, Express.js, React.js, Node.js) for tracking personal finances, income, and expenses.

## Features

- 🔐 User Authentication
  - Register/Login with email and password
  - Profile image upload
  - Protected routes
  - JWT token-based authentication

- 💰 Dashboard
  - Overview of total balance, income, and expenses
  - Visual representation of financial data using charts
  - Recent transactions list
  - Last 30 days expense analysis
  - Last 60 days income tracking

- 💵 Income Management
  - Add new income entries with source, amount, and date
  - Upload custom icons for income categories
  - View income history
  - Delete income entries
  - Download income data as Excel file
  - Income visualization through charts

- 💳 Expense Management
  - Add new expense entries with category, amount, and date
  - Upload custom icons for expense categories
  - View expense history
  - Delete expense entries
  - Download expense data as Excel file
  - Expense visualization through charts

## Tech Stack

### Frontend
- React.js + Vite
- Tailwind CSS
- React Router DOM
- Recharts for data visualization
- Axios for API calls
- React Context API for state management
- React Icons
- React Hot Toast for notifications

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Multer for file uploads
- XLSX for Excel file generation
- Bcrypt for password hashing

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Git

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/expense-tracker.git
cd expense-tracker
```

2. Install Backend Dependencies
```bash
cd backend
npm install
```

3. Configure Environment Variables
Create a `.env` file in the backend directory:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=8000
CLIENT_URL=http://localhost:5173
```

4. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

5. Configure Frontend Environment
Create a `.env` file in the frontend directory:
```env
VITE_BASE_URL=http://localhost:8000
```

### Running the Application

1. Start Backend Server
```bash
cd backend
npm run dev
```

2. Start Frontend Development Server
```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   └── server.js
└── frontend/
    ├── public/
    └── src/
        ├── components/
        ├── context/
        ├── hooks/
        ├── pages/
        └── utils/
```

## API Endpoints

### Auth Routes
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/getUser` - Get user info
- `POST /api/v1/auth/upload-image` - Upload profile image

### Income Routes
- `POST /api/v1/income/add` - Add new income
- `GET /api/v1/income/get` - Get all incomes
- `DELETE /api/v1/income/:id` - Delete income
- `GET /api/v1/income/downloadexcel` - Download income data

### Expense Routes
- `POST /api/v1/expense/add` - Add new expense
- `GET /api/v1/expense/get` - Get all expenses
- `DELETE /api/v1/expense/:id` - Delete expense
- `GET /api/v1/expense/downloadexcel` - Download expense data

### Dashboard Routes
- `GET /api/v1/dashboard` - Get dashboard data

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License

## Acknowledgments

- React Icons
- Recharts
- Tailwind CSS
- Express.js
- MongoDB