const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const { errorHandler } = require('./middleware/errorMiddleware');
const connectDB = require('./config/db');
const port = process.env.PORT || 5000;

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Setup Socket.IO with CORS support
const io = new Server(server, {
  cors: {
    origin: '*', // Allows cross-origin for development
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  }
});

// Make socket.io instance available globally in req
app.set('io', io);

// Socket.IO authentication middleware via JWT
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error: No token provided'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }
    socket.user = user;
    next();
  } catch (error) {
    return next(new Error('Authentication error: Invalid token'));
  }
});

// Handle Socket.IO connections
io.on('connection', (socket) => {
  const userId = socket.user._id.toString();
  // Join room named after the User's database ID
  socket.join(userId);
  console.log(`⚡ Real-time Socket connected: ${socket.user.name} (Room: ${userId})`);

  socket.on('disconnect', () => {
    console.log(`🔌 Real-time Socket disconnected: ${socket.user.name}`);
  });
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve uploaded task attachments
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

// Serve Frontend static assets in Production (Vite build folder)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'dist', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('API is running in development mode...');
  });
}

// Error Handler Middleware
app.use(errorHandler);

// Listen using HTTP server to support both HTTP and WebSocket protocols
server.listen(port, () => console.log(`Server started on port ${port}`));
