# NGO Dashboard

A modern full-stack web application for managing NGO operations, donations, and user registrations. Built with TypeScript, Express.js, React, and Prisma ORM.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Running the Project](#running-the-project)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)

## Features
- User authentication and authorization
- Admin dashboard for management
- Donation tracking and processing
- User registration system
- Secure JWT-based authentication
- RESTful API backend
- Responsive frontend interface

## Tech Stack

### Backend
- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** Express.js
- **Database ORM:** Prisma
- **Authentication:** JWT

### Frontend
- **Language:** TypeScript
- **Framework:** React
- **Build Tool:** Vite
- **Styling:** CSS

## Prerequisites
- Node.js (version 16 or higher)
- npm (version 7 or higher)
- Git

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/Adshdl-Zero/NGO-Dashboard.git
cd NGO-Dashboard
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

## Environment Setup

### Backend Environment Variables
Create a `.env` file in the `backend/` directory with the following variables:

```env
# Database Configuration
DATABASE_URL=your_database_connection_string

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRY=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# Authentication
AUTH_SALT_ROUNDS=10

# Payment Gateway (PayHere)
PAYHERE_MERCHANT_ID=your_merchant_id
PAYHERE_MERCHANT_SECRET=your_merchant_secret
PAYHERE_RETURN_URL=http://localhost:3000/donation-status
PAYHERE_CANCEL_URL=http://localhost:3000/donation-cancelled
PAYHERE_NOTIFY_URL=http://localhost:5000/api/donations/webhook

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

### Frontend Environment Variables
Create a `.env` file in the `frontend/` directory with the following variables:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# Application Configuration
VITE_APP_NAME=NGO Dashboard
VITE_APP_ENV=development
```

**Note:** Ensure you have obtained the necessary credentials:
- Database connection string from your database provider
- JWT secret (generate a strong random string)
- PayHere merchant credentials (from PayHere payment gateway)

## Running the Project

### Option 1: Run Backend and Frontend Separately

**Start Backend Server:**
```bash
cd backend
npm run dev
```
The backend will run on `http://localhost:5000`

**Start Frontend Server (in a new terminal):**
```bash
cd frontend
npm run dev
```
The frontend will run on `http://localhost:5173` (or as specified by Vite)

### Option 2: Run Both Simultaneously
From the root directory:
```bash
npm run dev
```

## Project Structure

```
NGO-Dashboard/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env (create this file)
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── styles/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── .env (create this file)
│
└── README.md
```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Donation Endpoints
- `GET /api/donations` - Get all donations
- `POST /api/donations` - Create new donation
- `GET /api/donations/:id` - Get donation by ID
- `POST /api/donations/webhook` - PayHere webhook handler

### Admin Endpoints
- `GET /api/admin/dashboard` - Get dashboard data
- `GET /api/admin/users` - Get all users
- `GET /api/admin/donations` - Get all donations

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Troubleshooting

### Port Already in Use
If ports 5000 or 5173 are already in use, you can specify a different port:

**Backend:**
```bash
PORT=5001 npm run dev
```

**Frontend:**
```bash
npm run dev -- --port 3001
```

### Database Connection Issues
- Verify your `DATABASE_URL` in the `.env` file
- Ensure your database server is running
- Check database credentials

### CORS Errors
- Verify `CORS_ORIGIN` in backend `.env` matches your frontend URL
- Check that both servers are running on the correct ports


**Happy coding! 🚀**