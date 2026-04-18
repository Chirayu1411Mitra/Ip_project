# UConnect

> UConnect is a student-focused collaboration platform for sharing notes, asking academic doubts, and staying connected with classmates in one place.

UConnect solves the common problem of scattered academic communication by combining key campus tools into a single web app. Students can upload and access notes, post questions, answer peer doubts, receive notifications, and manage profile information through a clean dashboard-style interface.

Built with a MERN-style architecture (MongoDB, Express, React, Node.js), UConnect uses JWT-based authentication, Socket.io for real-time notification flow, and AWS S3 integration for file uploads. The project is designed to be modular, scalable, and easy to extend for campus use cases.

---

## Features

- Authentication with secure token-based sessions
- Notes module with file upload and browse support
- Doubt forum for posting questions and answers
- Real-time notification integration
- User profile view and update flow
- Protected frontend routes with role-aware access control patterns

---

## Tech Stack

| Layer          | Technology                              |
| -------------- | --------------------------------------- |
| Frontend       | React, Vite, Tailwind CSS, React Router |
| Backend        | Node.js, Express                        |
| Database       | MongoDB with Mongoose                   |
| Real-time      | Socket.io                               |
| File Storage   | AWS S3                                  |
| Authentication | JWT + bcryptjs                          |

---

## Project Structure

- `backend/` - Express API, MongoDB models, authentication, notifications, upload services
- `frontend/` - React + Vite client app, pages, reusable components, API services

---

## Getting Started

### Prerequisites

- Node.js v18+
- npm
- MongoDB Atlas (or local MongoDB)
- AWS account with S3 bucket access

### 1) Install dependencies

```bash
# from project root
cd backend && npm install
cd ../frontend && npm install
```

### 2) Environment variables

Create a `.env` file in `backend/` with sample (fake) values:

```env
Port=5000
FRONTEND_URL=http://localhost:5173

MONGODB_URL=mongodb+srv://demo_user:demo_pass_123@demo-cluster.mongodb.net/uconnect_dev?retryWrites=true&w=majority

JWT_SECRET=uconnect_demo_jwt_secret_change_me
NODE_ENV=development

AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=uconnect-demo-bucket
```

Create a `.env` file in `frontend/` with sample (fake) values:

```env
VITE_API_BASE_URL=http://localhost:5000
```

### 3) Run the app

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173` in your browser.
