// backend/src/server.ts
import dotenv from 'dotenv';
import app from './app'; // Imports the configured app
import pool from './config/database';
import requisitionRoutes from './routes/v1/requisition.routes';

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, async () => {
  console.log(`\n=================================`);
  console.log(`🚀 NERSF GOVERNMENT SERVER LIVE`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`=================================`);

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