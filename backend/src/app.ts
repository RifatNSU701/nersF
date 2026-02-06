import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';

// =======================
// 1. IMPORT ROUTES
// =======================
import authRoutes from './routes/v1/auth.routes';
import tenderRoutes from './routes/v1/tenders.routes';
import bidRoutes from './routes/v1/bid.routes';
import vendorRoutes from './routes/v1/vendor.routes'; 
import storageRoutes from './routes/v1/storage.routes'; 
import { startCurrencyOracle } from './services/currency.service';
import requisitionRoutes from './routes/v1/requisition.routes';

const app: Application = express();

// =======================
// 2. SECURITY MIDDLEWARE
// =======================
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// =======================
// 3. MOUNT API ROUTES
// =======================
app.use('/api/v1/auth', authRoutes);     // Auth
app.use('/api/v1/tenders', tenderRoutes); // Tenders
app.use('/api/v1/bids', bidRoutes);       // Bids
app.use('/api/vendors', vendorRoutes);    // Vendors
app.use('/api/storage', storageRoutes);   // Storage (Warehouses)
app.use('/api/requisitions', requisitionRoutes);


// Health Check
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ status: 'success', system: 'NERSF Backend v1' });
});

// =======================
// 4. GLOBAL ERROR HANDLER
// =======================
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ status: 'error', message: 'Internal Server Error' });
});

// =======================
// 5. START BACKGROUND SERVICES
// =======================
startCurrencyOracle();

export default app;