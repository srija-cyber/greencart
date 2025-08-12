import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { Server } from 'socket.io'; // Import Server from socket.io
import http from 'http'; // Import http module
import config from './config.js';
import Counter from './models/Counter.js';
import Order from './models/Order.js';
import authRoutes from './routes/auth.js';
import driverRoutes from './routes/drivers.js';
import routeRoutes from './routes/routes.js';
import orderRoutes from './routes/orders.js';
import simulationRoutes from './routes/simulations.js'; // Import simulation routes

const app = express();
const server = http.createServer(app); // Create HTTP server
const io = new Server(server, { // Initialize Socket.IO with the HTTP server
  cors: {
    origin: "*", // Allow all origins for now, refine in production
    methods: ["GET", "POST"]
  }
});

const PORT = config.PORT;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(limiter);

// MongoDB Connection
mongoose.connect(config.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    console.log(`MongoDB URI: ${config.MONGODB_URI}`);
    // Ensure orderNumber counter is at least current max
    try {
      const maxOrder = await Order.findOne().sort({ orderNumber: -1 }).select('orderNumber');
      let currentSeq = 0;
      if (maxOrder && maxOrder.orderNumber) {
        const numeric = parseInt(String(maxOrder.orderNumber).replace(/^GC/, ''), 10);
        if (Number.isFinite(numeric)) currentSeq = numeric;
      }
      await Counter.findByIdAndUpdate('orderNumber', { $set: { seq: currentSeq } }, { upsert: true });
      console.log('Order counter synced to', currentSeq);
    } catch (err) {
      console.warn('Could not sync order counter:', err?.message || err);
    }
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Pass io instance to routes that need it
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/simulations', simulationRoutes); // Use simulation routes

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });

  // Example: Join a simulation room
  socket.on('joinSimulation', (runId) => {
    socket.join(runId);
    console.log(`Socket ${socket.id} joined simulation room ${runId}`);
  });

  socket.on('leaveSimulation', (runId) => {
    socket.leave(runId);
    console.log(`Socket ${socket.id} left simulation room ${runId}`);
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'GreenCart API is running' });
});

server.listen(PORT, () => { // Listen with the HTTP server, not app
  console.log(`Server running on port ${PORT}`);
});
