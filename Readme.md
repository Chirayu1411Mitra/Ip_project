# CampusConnect

> CampusConnect is a real-time student collaboration and resource management platform designed specifically for university environments. It provides a centralized and structured space where students can share academic resources, interact with peers, and stay organized with their coursework.

In many campuses, students rely on fragmented tools like messaging apps or shared drives, which lack proper organization, real-time collaboration, and academic-focused features. CampusConnect solves this problem by integrating multiple functionalities into a single platform.

The platform allows users to upload and access study materials, post academic doubts and receive peer responses, and participate in real-time study group discussions. Additionally, it includes a deadline tracking system to help students manage assignments efficiently, along with notifications to keep them updated.

Built using the MERN stack (MongoDB, Express.js, React.js, Node.js), CampusConnect also leverages technologies like Socket.io for real-time communication, JWT for secure authentication, and cloud services for file storage and notifications. The system is designed to be scalable, secure, and user-friendly.

Overall, CampusConnect aims to enhance peer-to-peer learning, improve academic productivity, and create a collaborative digital ecosystem for students within a campus.

---

## Features

- **Notes hub** — Upload and browse PDFs organized by subject and semester
- **Doubt forum** — Post academic questions, get peer answers, upvote the best ones
- **Study group chat** — Create real-time chat rooms with live messaging
- **Deadline tracker** — Add and manage assignment deadlines with urgency badges
- **Notifications** — In-app alerts for new answers and upcoming deadlines
- **Dashboard** — Personal activity stats and progress charts

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, Tailwind CSS, React Router, Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (Mongoose ODM) |
| Real-time | Socket.io |
| File Storage | Cloudinary |
| Authentication | JWT + bcrypt |
| Hosting | Vercel (frontend), Render (backend) |

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account (free M0 tier)
- Cloudinary account (free tier)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/campusconnect.git
cd campusconnect
```

**Backend setup**

```bash
cd server
npm install
```

Create a `.env` file inside `/server`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/campusconnect
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:3000
```

```bash
npm run dev      # starts server on port 5000
```

**Frontend setup**

```bash
cd client
npm install
```

Create a `.env` file inside `/client`:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

```bash
npm start        # starts React app on port 3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser.