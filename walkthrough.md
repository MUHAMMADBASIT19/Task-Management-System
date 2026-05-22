# 🏆 Final Walkthrough: TaskFlow PRO (Weeks 4 - 6 Complete)

This document provides a complete guide to verifying and running all the advanced features implemented in **TaskFlow PRO** for Weeks 4, 5, and 6.

---

## 🚀 Key Features Implemented

### 👥 1. Collaborative Tasks & Sharing (Week 4)
- **Granular Sharing:** Users can share any of their owned tasks with colleagues using their registered email.
- **Security & Authorization Limits:** 
  - **Task Owner:** Full control to edit details (Title, Description, Due Date), manage attachments, share the task further, or delete the task.
  - **Collaborators:** Restricted access. Collaborators can only see task details and toggle the task's progress state (`Pending` ➡️ `In Progress` ➡️ `Completed`). Attempting to edit other details results in a `403 Forbidden` restriction.

### ⚡ 2. Real-Time WebSocket Notifications (Week 4)
- **Engineered with Socket.IO:** Installs an authenticated WebSocket connection verified via JWT tokens.
- **Immediate Audio-Visual Alerts:** When a task is shared with a user or when status updates occur, a sliding toast pop-up appears in real time on the recipient's screen, accompanied by a clean notification ring sound using the standard Web Audio API.
- **Persistent Log & Badge:** An interactive notification bell displays unread count badges and lists past notifications with read-status toggling.

### 📊 3. High-Performance Server-Side Analytics (Week 5)
- **MongoDB Aggregation Pipeline:** Aggregates statistics directly inside MongoDB for lightning-fast performance, avoiding frontend processing delays.
- **Recharts Data Visualizations:**
  - **Work Allocation Pie Chart:** Breakdown of Pending, In Progress, and Completed tasks.
  - **Daily Trends Area Chart:** A beautiful, responsive gradient area graph displaying completed vs. overdue tasks over the last 15 days.

### 📁 4. Local File Attachments (Week 6)
- **Multer Integration:** Allows users to attach files (images, PDFs, documents up to 5MB) directly onto tasks.
- **Interactive UI:** Upload files via standard file inputs, view attachments in task details, click to download, or delete them (owners only).
- **Filesystem Integrity:** Deleting an attachment pulls it from Mongoose and deletes the physical file from the backend's `/uploads` folder.

### 🌙 5. Sleek Dark Mode (Week 6)
- **Persistent Glassmorphism Theme:** Dark/Light mode toggle that syncs with `localStorage` and adapts the entire workspace to a stunning slate/indigo neon-glass layout.

---

## 📽️ End-to-End Verification Guide

To test the multi-user features and notifications, you should open **two different browser sessions** (e.g., standard browser window + incognito window).

### Step 1: Register and Login two Users
1. Open the app in your browser (`http://localhost:5173`).
2. Register **User A** (e.g., `alex@taskflow.com`).
3. Open an Incognito window and register **User B** (e.g., `basit@taskflow.com`).

### Step 2: Share a Task and Verify Socket.IO notifications
1. On **User A's** dashboard, create a new task named `"Write Marketing Report"`.
2. Click the **Share** (group icon) button on the task card.
3. Type **User B's** email (`basit@taskflow.com`) and click **Share**.
4. **Instantly look at User B's screen:** A gorgeous slide-in Toast alert will appear with a subtle pop sound!
5. In **User B's** workspace, click the **Shared** tab. The task `"Write Marketing Report"` will be visible, marked with an **"Owned by Alex"** badge.

### Step 3: Status Toggles & Permission Guards
1. On **User B's** screen, change the status of `"Write Marketing Report"` to `"In Progress"`.
2. **Instantly look at User A's screen:** A notification toast slides in telling Alex that Basit updated the status!
3. Open the task edit modal on **User B's** screen. Notice that all input fields (Title, Description, Due Date) are disabled with a message: *"Collaborators are only authorized to update task status"*.

### Step 4: Attachments Upload & Disk Cleanup
1. On **User A's** screen (the task owner), click the paperclip button on the task.
2. Select any file (image/PDF up to 5MB) and upload it.
3. The attachment is listed instantly. **User B** can view and download it immediately.
4. Click Delete on **User A's** attachment. The file is instantly deleted from both the database and the backend's disk (`backend/uploads/`), keeping files clean and dry.

### Step 5: Check Analytics
1. Navigate to the **Analytics** tab on either user's screen.
2. See the real-time Pie and Area charts updating as tasks are updated!

---

## 🛠️ Launch Commands

Ensure both folders have had their dependencies downloaded:

```bash
# In the backend terminal:
cd backend
npm install
npm run dev

# In a separate frontend terminal:
cd frontend
npm install
npm run dev
```
