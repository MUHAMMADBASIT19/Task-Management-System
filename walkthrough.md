# Walkthrough: Week 1 - Backend Development

I have successfully set up the backend infrastructure for your Task Management System.

## Changes Made

### Backend Setup
- **Environment:** Initialized Node.js project with `express`, `mongoose`, `dotenv`, and `joi`.
- **Database:** Configured Mongoose to connect to MongoDB Atlas.
- **Task Model:** Created a schema with fields for `title`, `description`, `status`, and `dueDate`.
- **CRUD Endpoints:**
    - `POST /api/tasks`: Add a new task (with validation).
    - `GET /api/tasks`: Fetch all tasks.
    - `GET /api/tasks/:id`: Fetch a single task by ID.
    - `PUT /api/tasks/:id`: Update a task.
    - `DELETE /api/tasks/:id`: Delete a task.
- **Error Handling:** Implemented a centralized error handling middleware to manage errors gracefully.

## How to Run the Backend

1. **Set up MongoDB Atlas:**
   Follow the guide in the [implementation_plan.md](file:///C:/Users/SarmadSajjad/.gemini/antigravity/brain/b835d362-6d64-4155-b65e-25050ec94c95/implementation_plan.md) to get your connection string.
2. **Update Environment Variables:**
   Open the `.env` file in the `backend` folder and paste your connection string:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
3. **Install Dependencies:**
   ```bash
   cd backend
   npm install
   ```
4. **Start the Server:**
   ```bash
   npm run dev
   ```
   (I'll update the `package.json` to include the `dev` script in the next step).

## Validation in Action
The `POST` route uses **Joi** to ensure that:
- Title and Description are provided.
- Status is one of: `Pending`, `In Progress`, `Completed`.
- Due Date is a valid date.

---

> [!TIP]
> You can test these endpoints using tools like Postman or Insomnia once the database is connected.
