import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';

// =======================
// 1. IMPORT ROUTES
// =======================
import authRoutes from './routes/v1/auth.routes';
import tenderRoutes from './routes/v1/tenders.routes';
import bidRoutes from './routes/v1/bid.routes';
import vendorRoutes from './routes/v1/vendor.routes'; 
import storageRoutes from './routes/v1/storage.routes'; 
import requisitionRoutes from './routes/v1/requisition.routes';
import cmsRoutes from './routes/v1/cms.routes';
import crmRoutes from './routes/v1/crm.routes';
import tradeRoutes from './routes/v1/trade.routes'; 
import uploadRoutes from './routes/v1/upload.routes';
import { startCurrencyOracle } from './services/currency.service';
import exportRoutes from './routes/v1/export.routes';

const app: Application = express();

// =======================
// 2. SECURITY MIDDLEWARE
// =======================
// FIX: Disable blocking of cross-origin images so frontend can load them
app.use(helmet({
  crossOriginResourcePolicy: false, 
}));

app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true // Important for cookies/sessions if we use them later
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// =======================
// 3. STATIC FILES (Serve Uploads)
// =======================
// FIX: This line was missing! It allows access to the files.
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// =======================
// 4. MOUNT API ROUTES
// =======================
app.use('/api/v1/auth', authRoutes);     // Auth
app.use('/api/v1/tenders', tenderRoutes); // Tenders
app.use('/api/v1/bids', bidRoutes);       // Bids
app.use('/api/v1/vendors', vendorRoutes);    // Vendors
app.use('/api/v1/storage', storageRoutes);   // Storage (Warehouses)
app.use('/api/v1/requisitions', requisitionRoutes); // Requisitions
app.use('/api/v1/cms', cmsRoutes);        // CMS (News & Notices)
app.use('/api/v1/crm', crmRoutes);        // CRM (Complaints & Feedback)
app.use('/api/v1/trade', tradeRoutes);    // Import & Export
app.use('/api/v1/upload', uploadRoutes);  // File Uploads
app.use('/api/v1/export', exportRoutes); //Data Export (CSV, Excel)

// Health Check
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ status: 'success', system: 'NERSF Backend v1' });
});

// =======================
// 5. GLOBAL ERROR HANDLER
// =======================
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ status: 'error', message: 'Internal Server Error' });
});

// =======================
// 6. START BACKGROUND SERVICES
// =======================
startCurrencyOracle();

export default app;