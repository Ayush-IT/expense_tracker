# Expense Tracker Web Application

A full-stack web application built with the MERN stack (MongoDB, Express.js, React.js, Node.js) for tracking personal finances, income, and expenses. Now supports persistent, secure image uploads via Cloudinary cloud storage.

## Features

- 🔐 **User Authentication**

  - Register/Login with email and password
  - Email verification on signup (with resend)
  - Forgot/Reset password via secure email links
  - Profile image upload (now stored securely on Cloudinary)
  - Protected routes
  - JWT token-based authentication
  - Google OAuth login (one-tap) using Google Identity Services

- 💰 **Dashboard**

  - Overview of total balance, income, and expenses
  - Visual representation of financial data using charts
  - Recent transactions list
  - Last 30 days expense analysis
  - Last 60 days income tracking

- 💵 **Income Management**

  - Add new income entries with source, amount, and date
  - Upload custom icons for income categories
  - View income history
  - Delete income entries
  - Download income data as Excel file
  - Income visualization through charts

- 💳 **Expense Management**
  - Add new expense entries with category, amount, and date
  - Upload custom icons for expense categories
  - View expense history
  - Delete expense entries
  - Download expense data as Excel file
  - Expense visualization through charts

- 🧾 **Bills Management**
  - Create, view, update, delete bills
  - Mark bills as paid, pause/resume a bill
  - Automatic status updates: `upcoming`, `due_today`, `overdue`
  - Email reminders at your preferred local hour and days before due date

- 📅 **Recurring Transactions**
  - Auto-generate recurring incomes and expenses based on recurrence rules (weekly, monthly, custom days)

- 📊 **Budgets**
  - Create monthly budgets and track spending vs. target

- 👤 **Profile & Preferences**
  - Update profile info, upload profile image
  - Configure timezone and notification preferences for accurate reminders

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
- **Cloudinary for persistent image storage**
- multer-storage-cloudinary for direct uploads
- XLSX for Excel file generation
- Bcrypt for password hashing
- Nodemailer for transactional emails (verification/reset)
- node-cron for scheduled jobs (recurring transactions, bill reminders)
- google-auth-library for Google OAuth verification

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
   Create a `.env` file in the `backend/` directory:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=8000
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
APP_BASE_URL=http://localhost:8000
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
SEND_FROM="Expense Tracker <no-reply@yourdomain.com>"  # used by utils/sendEmail.js
FROM_EMAIL="Expense Tracker <no-reply@yourdomain.com>" # used by services/notificationService.js
GOOGLE_CLIENT_ID=your_google_oauth_client_id
# Optional scheduler overrides (defaults: dev every minute; prod daily/hourly)
RECURRING_CRON=* * * * *
REMINDER_CRON=* * * * *
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
│   ├── cron/                 # scheduled jobs for recurrence and reminders
│   ├── services/             # email notification service
│   ├── utils/                # recurrence utilities, helpers
│   ├── uploads/              # (legacy) not used when Cloudinary is configured
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

- `POST /api/v1/auth/register` - Register new user and send verification email
- `POST /api/v1/auth/login` - Login user (requires verified email)
- `GET /api/v1/auth/getUser` - Get user info
- `GET /api/v1/auth/verify-email?token=...&email=...` - Verify email (redirects to frontend on success/failure)
- `POST /api/v1/auth/resend-verification` - Resend verification email
- `POST /api/v1/auth/forgot-password` - Send password reset email
- `POST /api/v1/auth/reset-password` - Reset password using token, email, newPassword
- `POST /api/v1/auth/upload-image` - Upload profile image (now uploads to Cloudinary)
- `POST /api/v1/auth/google` - Google OAuth login with `idToken`

### Income Routes

- `POST /api/v1/income/add` - Add new income
- `GET /api/v1/income/get` - Get all incomes
- `DELETE /api/v1/income/:id` - Delete income
- `GET /api/v1/income/downloadexcel` - Download income data
- `PUT /api/v1/income/:id` - Update income

### Expense Routes

- `POST /api/v1/expense/add` - Add new expense
- `GET /api/v1/expense/get` - Get all expenses
- `DELETE /api/v1/expense/:id` - Delete expense
- `GET /api/v1/expense/downloadexcel` - Download expense data
- `PUT /api/v1/expense/:id` - Update expense

### Dashboard Routes

- `GET /api/v1/dashboard` - Get dashboard data

### Budget Routes

- `POST /api/v1/budgets` - Create budget
- `GET /api/v1/budgets?month=MM&year=YYYY` - Get budgets for a month
- `PUT /api/v1/budgets/:id` - Update budget
- `DELETE /api/v1/budgets/:id` - Delete budget

### Profile Routes

- `GET /api/v1/profile` - Get profile
- `PUT /api/v1/profile/update` - Update profile
- `POST /api/v1/profile/upload-image` - Upload profile image (Cloudinary)

### Bill Routes

- `POST /api/v1/bills` - Create bill
- `GET /api/v1/bills` - List bills
- `GET /api/v1/bills/:id` - Get bill by id
- `PUT /api/v1/bills/:id` - Update bill
- `DELETE /api/v1/bills/:id` - Delete bill
- `POST /api/v1/bills/:id/pay` - Mark bill as paid
- `POST /api/v1/bills/:id/pause` - Pause reminders/status updates
- `POST /api/v1/bills/:id/resume` - Resume reminders/status updates

## Auth Flows

### Email Verification

- __Register__: `POST /api/v1/auth/register` creates the user and emails a verification link.
- __Verify__: `GET /api/v1/auth/verify-email?token=...&email=...` validates the token.
  - On success: redirects to `${CLIENT_URL}/auth/verified?status=success`.
  - On failure/expired: redirects to `${CLIENT_URL}/auth/verified?status=failed&reason=invalid_or_expired`.
- __Resend__: `POST /api/v1/auth/resend-verification` with body `{ email }` to get a new link.

Environment used for links: `APP_BASE_URL` or `CLIENT_URL` (backend falls back appropriately).

### Password Reset

- __Request__: `POST /api/v1/auth/forgot-password` with body `{ email }`.
  - Sends an email with link to `${CLIENT_URL}/auth/reset?token=...&email=...`.
- __Reset__: `POST /api/v1/auth/reset-password` with body `{ token, email, newPassword }`.
  - Token expires in 1 hour. On success returns message `Password has been reset successfully`.

### Google OAuth Login

- __Login__: `POST /api/v1/auth/google` with body `{ idToken }` from Google Identity Services.
- Server verifies the token using `google-auth-library` and returns our JWT.
- First-time users are auto-provisioned and marked verified.

## Cron Jobs & Reminders

- __Recurring Transactions__: A scheduler runs based on `RECURRING_CRON` to auto-create entries from recurring templates in `Income`/`Expense`.
  - Default dev schedule: every minute.
  - Default prod schedule: daily at 00:05.
- __Bill Reminders__: A scheduler runs based on `REMINDER_CRON` to update bill statuses and send reminders.
  - Default dev schedule: every minute.
  - Default prod schedule: hourly at minute 5.
- Configure these in `backend/.env` using standard cron expressions.

### Timezone & Reminder Behavior

- Each bill can specify `timezone` and `remindAtHourLocal` (0–23). If omitted, user profile timezone is used, else defaults to `Asia/Kolkata`.
- Bill statuses are computed by comparing the local date in the chosen timezone.
- Reminders are sent on days matching `remindDaysBefore` and every day after due date until paid (at the configured reminder hour).

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
