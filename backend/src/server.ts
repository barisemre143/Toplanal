import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';

import routes from './routes';
import pool from './config/database';
import { env } from './config/env';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: env.frontendUrl,
    methods: ["GET", "POST"]
  }
});

const PORT = env.port;

app.use(helmet());
app.use(cors({
  origin: env.frontendUrl,
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!'
  });
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-cart', (cartId) => {
    socket.join(`cart-${cartId}`);
    console.log(`User ${socket.id} joined cart ${cartId}`);
  });

  socket.on('leave-cart', (cartId) => {
    socket.leave(`cart-${cartId}`);
    console.log(`User ${socket.id} left cart ${cartId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const startServer = async () => {
  try {
    await pool.query('SELECT NOW()');
    console.log('Database connected successfully');

    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export { io };