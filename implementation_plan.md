# Task Management System Implementation Plan

This plan outlines the development of a full-stack Task Management System over a three-week schedule, as per the internship requirements.

## Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **Frontend:** React.js (Vite), Tailwind CSS
- **Authentication:** JWT (JSON Web Tokens)
- **Validation:** Joi or express-validator
- **Testing:** Jest

---

## Free Tier Services & Tools
Since this is an internship project, we will use the following free resources:
1. **GitHub:** For code hosting (free).
2. **MongoDB Atlas:** Free M0 cluster for the database.
3. **Render/Vercel:** Optional for free hosting if needed later.

---

## How to Set Up MongoDB Atlas (Free)
Before we start the backend, you'll need a database URL.
1. Sign up at [mongodb.com](https://www.mongodb.com/cloud/atlas/register).
2. Create a **Shared Cluster** (Free / M0).
3. Choose a provider (e.g., AWS) and region near you.
4. In **Network Access**, click "Add IP Address" and select "Allow Access from Anywhere".
5. In **Database Access**, create a user with a username and password.
6. Click **Connect** -> **Connect your application** -> Copy the connection string.
   - It will look like: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
7. Keep this string ready; we'll use it in our `.env` file.


---

## Phase 1: Backend Development (Week 1)

### Goals
- Set up a robust Node.js/Express server.
- Integrate MongoDB for persistent storage.
- Implement CRUD operations for tasks.
- Ensure data integrity with validation.

### Proposed Changes

#### [NEW] [Backend Structure](file:///c:/Users/SarmadSajjad/Desktop/Basit/backend/)
- `server.js`: Main entry point.
- `models/Task.js`: Mongoose schema for tasks (Title, Description, Status, Due Date).
- `routes/taskRoutes.js`: API endpoints for CRUD.
- `controllers/taskController.js`: Logic for task operations.
- `middleware/errorMiddleware.js`: Centralized error handling.
- `config/db.js`: Database connection configuration.

---

## Phase 2: Frontend Development (Week 2)

### Goals
- Create a modern, responsive UI using React and Tailwind CSS.
- Integrate with the backend API using Axios.
- Implement Task List, Task Form (Create/Edit), and Task Details views.

### Proposed Changes

#### [NEW] [Frontend Structure](file:///c:/Users/SarmadSajjad/Desktop/Basit/frontend/)
- `components/TaskList.jsx`: Displays all tasks with status indicators.
- `components/TaskForm.jsx`: Modal or page for creating/editing tasks.
- `components/TaskCard.jsx`: Individual task item representation.
- `services/api.js`: Axios instance configuration and API calls.
- `styles/index.css`: Tailwind configuration and custom styling.

---

## Phase 3: Advanced Features & Polishing (Week 3)

### Goals
- Add User Authentication (Register/Login).
- Implement Search and Filter functionality.
- Add Task Progress indicators.
- Write unit tests and perform final polishing.

### Proposed Changes

#### [MODIFY] [Backend & Frontend]
- Add Auth routes and middleware on backend.
- Create Login/Register pages on frontend.
- Update Task List to include Search Bar and Filter dropdowns.
- Add a Dashboard view with a progress bar showing task completion percentage.

---

## Open Questions
- **MongoDB Connection:** User confirmed they will set up a free MongoDB Atlas cluster. I will provide guidance on how to use the connection string.
- **Design:** User confirmed no specific theme, so I will apply a modern premium aesthetic.

## Verification Plan

### Automated Tests
- Run `npm test` on backend (Jest) to verify API endpoints.
- Run Vitest/React Testing Library for frontend components.

### Manual Verification
- Test all CRUD operations via the UI.
- Verify JWT authentication flow (Login/Register/Protected routes).
- Ensure responsiveness across mobile and desktop views.
