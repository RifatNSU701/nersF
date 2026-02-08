// backend/src/server.ts
import dotenv from 'dotenv';
import app from './app'; // Imports the configured app
import pool from './config/database';
import { initSocket } from './services/socket.service'; // <--- NEW IMPORT

dotenv.config();

const PORT = process.env.PORT || 5000;

// 1. Start the HTTP Server
const server = app.listen(PORT, async () => {
  console.log(`\n=================================`);
  console.log(`🚀 NERSF GOVERNMENT SERVER LIVE`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`=================================`);

  // 2. Test Database Connection
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL Database Connected Successfully!');
    connection.release();
  } catch (error: any) {
    console.error('❌ FATAL ERROR: Database Connection Failed!');
    console.error(error.message);
    process.exit(1);
  }
});

// 3. Attach Socket.io to the running server
initSocket(server); // <--- ACTIVATES REAL-TIME CHAT