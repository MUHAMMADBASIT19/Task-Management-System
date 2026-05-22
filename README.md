# 🚀 TaskFlow PRO - Task Management & Collaboration Platform

Welcome to **TaskFlow PRO**, an advanced, full-stack Task Management System designed for modern team collaboration and data-driven productivity. Equipped with a sleek dark-mode glassmorphic interface, real-time WebSocket notifications, high-performance MongoDB aggregations, and local file attachment uploading.

---

## 🌟 Core Features

### 1. Multi-User Collaboration & Task Sharing (Week 4)
- **Granular Permissions:** Task owners can share their tasks with other users by email.
- **Role-Based Editing:** Collaborators can update a shared task's progress state (status) to keep the team aligned, while title, description, and attachments are securely locked for modification by the owner only.
- **Private Shared Views:** Access a dedicated space showing only tasks shared with you.

### 2. Real-Time WebSocket Notifications (Week 4)
- **Live Push Alerts:** Driven by **Socket.IO** over an authenticated WebSocket handshake, clients receive toast notifications immediately.
- **Dynamic Events:** Users are alerted instantly when:
  - A task is shared with them.
  - A task collaborator or owner updates the task status.
- **Persistent Logs:** A complete notification bell dropdown keeps track of read and unread messages for easy management.

### 3. Advanced Analytics & Reporting (Week 5)
- **MongoDB Aggregation Framework:** Highly optimized server-side group queries compile total work statistics instantaneously.
- **Interactive Recharts Visualizations:**
  - **Area/Trend Chart:** Evaluates active performance trends (Completed vs Overdue tasks over time).
  - **Pie Chart:** Breaks down task allocations (Pending, In Progress, Completed).

### 4. Custom Styling, Dark Mode & Attachments (Week 6)
- **Dual-Mode Visuals:** Seamless, persistent Dark Mode toggle backed by `localStorage` utilizing HSL color variables and glassmorphic aesthetics.
- **Local File Attachments:** Upload files and documents (spreadsheets, PDFs, images) up to 5MB, managed locally via `multer` disk storage with auto-cleanup.
- **Mobile Responsiveness:** Designed from the ground up for screens of all sizes, featuring compact sliders and modals.

---

## 🛠️ Technology Stack

- **Frontend:** React 19 (Vite), Tailwind CSS v4, Framer Motion, Recharts, Axios, Socket.IO-Client, Lucide-React.
- **Backend:** Node.js, Express.js, MongoDB (Mongoose), Socket.IO, Multer, JWT, Joi, Jest, Supertest.

---

## 📂 Project Directory Structure

```
Task-Management-System/
├── backend/
│   ├── config/             # Database connection configuration
│   ├── controllers/        # Task, Notification, Attachment & Analytics controllers
│   ├── middleware/         # Auth, Multer upload & Central error handling
│   ├── models/             # Mongoose schemas (User, Task, Notification)
│   ├── routes/             # Express routes
│   ├── tests/              # Jest integration testing suites
│   ├── server.js           # Server entry point wrapping HTTP & WebSockets
│   └── package.json
├── frontend/
│   ├── public/             # Static SVGs and tab icons
│   ├── src/
│   │   ├── assets/         # App graphics & illustrations
│   │   ├── components/     # App views (TaskList, Analytics, TaskCard, Forms, Auth)
│   │   ├── services/       # Unified Axios API layer
│   │   ├── App.jsx         # Main layout wrapping state, dark-mode & WebSockets
│   │   ├── index.css       # Tailwind v4 imports & custom CSS animations
│   │   └── main.jsx
│   └── package.json
└── README.md               # Global project handbook
```

---

## 🚀 Quick Setup Instructions

### Prerequisites
Make sure you have [Node.js](https://nodejs.org) (v18+) and a running [MongoDB Atlas Connection String](https://www.mongodb.com/cloud/atlas).

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Setup your environment configuration by editing `.env`:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/taskflow?retryWrites=true&w=majority
   JWT_SECRET=your_jwt_signing_key_here
   ```
3. Start the development server (runs with nodemon):
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Start the Vite React development server:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to `http://localhost:5173`.

---

## 📘 Comprehensive API Documentation

All requests except Auth require a Bearer token header: `Authorization: Bearer <your_jwt_token>`.

### Authentication Routes
#### `POST /api/users` - Register a new user
- **Request Body:**
  ```json
  {
    "name": "Alex Carter",
    "email": "alex@taskflow.com",
    "password": "securepassword123"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "_id": "60d0123456789abcdef00001",
    "name": "Alex Carter",
    "email": "alex@taskflow.com",
    "token": "eyJhbGciOiJIUzI1NiIsIn..."
  }
  ```

#### `POST /api/users/login` - Authenticate a user
- **Request Body:**
  ```json
  {
    "email": "alex@taskflow.com",
    "password": "securepassword123"
  }
  ```
- **Response (200 OK):** Identical to registration output.

---

### Task Routes
#### `GET /api/tasks` - Retrieve tasks owned by the user
- **Response (200 OK):** Array of task objects.

#### `GET /api/tasks/shared` - Retrieve tasks shared with the user
- **Response (200 OK):** Array of tasks populated with owner names.

#### `PUT /api/tasks/:id/share` - Share a task with a colleague
- **Request Body:**
  ```json
  {
    "email": "colleague@taskflow.com"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "message": "Task shared successfully",
    "task": { ... }
  }
  ```

---

### Attachments Routes
#### `POST /api/tasks/:id/attachments` - Upload a file to a task
- **Request Format:** `multipart/form-data` with field key `file`.
- **Response (200 OK):** Updated task array including attachment metadata:
  ```json
  "attachments": [
    {
      "filename": "quarterly_budget.pdf",
      "path": "/uploads/1716388421890-99824219.pdf",
      "mimetype": "application/pdf",
      "size": 1542890
    }
  ]
  ```

---

### Analytics Routes
#### `GET /api/analytics/overview` - Aggregate summary counts
- **Response (200 OK):**
  ```json
  {
    "Pending": 4,
    "In Progress": 2,
    "Completed": 8,
    "Total": 14
  }
  ```

#### `GET /api/analytics/trends` - Daily completion and overdue trends
- **Response (200 OK):**
  ```json
  [
    { "date": "2026-05-18", "completed": 2, "overdue": 0 },
    { "date": "2026-05-19", "completed": 3, "overdue": 1 },
    { "date": "2026-05-20", "completed": 1, "overdue": 0 }
  ]
  ```

---

## 🔒 Security & Authorization Policies
1. **Sharing Lock:** Only the creator (`owner`) can share the task or attach/delete files.
2. **Deletion Guard:** Only the task creator (`owner`) can delete a task.
3. **Collaborator Safeguard:** Collaborators (`sharedWith`) are restricted from altering titles, descriptions, or due dates; any unauthorized modification returns a `403 Forbidden` response.
