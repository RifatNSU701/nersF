import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: SocketIOServer;

export const initSocket = (httpServer: HttpServer) => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || "http://localhost:5173",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`⚡ New Client Connected: ${socket.id}`);

    // 1. Join a specific chat room (e.g., "ticket_123")
    socket.on('join_room', (room) => {
      socket.join(room);
      console.log(`User ${socket.id} joined room: ${room}`);
    });

    // 2. Listen for chat messages
    socket.on('send_message', (data) => {
      // data = { room: "ticket_123", message: "Hello Admin", sender: "User" }
      
      // Broadcast to everyone ELSE in that room
      socket.to(data.room).emit('receive_message', data);
    });

    // 3. Handle Disconnect
    socket.on('disconnect', () => {
      console.log('Client Disconnected', socket.id);
    });
  });
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};