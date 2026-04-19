# 🚀 Quick Start Guide: Task Management System

Follow these steps to launch the application on your computer.

---

## Step 1: Install Node.js
If you don't have Node.js, you must install it to run the app.
1. Go to [nodejs.org](https://nodejs.org/).
2. Download and install the **LTS** version.
3. Once installed, **restart VS Code**.

## Step 2: Open the Project
1. Open VS Code.
2. Go to `File` > `Open Folder...` and select `Task-Management-System`.

---

## Step 3: Launch the Backend
1. Open a terminal in VS Code (`Terminal` > `New Terminal`).
2. **Download Dependencies** (Crucial Step):
   ```bash
   cd backend
   npm install
   ```
3. Start the server:
   ```bash
   npm run dev
   ```
   *Wait until you see "Connected to MongoDB".*

---

## Step 4: Launch the Frontend
1. Open a **second** terminal window in VS Code (click the `+` icon).
2. **Download Dependencies** (Crucial Step):
   ```bash
   cd frontend
   npm install
   ```
3. Start the app:
   ```bash
   npm run dev
   ```
4. **Open the App**: Ctrl + Click the link (http://localhost:5173) in the terminal.

---

**Note:** The environment variables (database links) are already configured for you in the `.env` file. You just need to install the dependencies and run the start commands! 🚀
