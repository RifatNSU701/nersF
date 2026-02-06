import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Create the Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10, // Max 10 active connections at once
  queueLimit: 0
});

// Function to Test Connection
export const connectDB = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL Database Connected Successfully!');
    connection.release(); // Always release the connection back to the pool
  } catch (error) {
    console.error('❌ Database Connection Failed:', error);
    process.exit(1); // Kill the server if DB is down
  }
};

export default pool;