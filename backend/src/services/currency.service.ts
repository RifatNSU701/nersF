import axios from 'axios';
import cron from 'node-cron';
import pool from '../config/database'; 

// ==========================================
// CONFIGURATION
// ==========================================
// 1. Fiat Source: Open Exchange Rates (Free Endpoint)
const FIAT_API_URL = 'https://api.exchangerate-api.com/v4/latest/BDT';

// 2. Crypto Source: CoinGecko (Free Public API)
const CRYPTO_API_URL = 'https://api.coingecko.com/api/v3/simple/price';

// Map our DB symbols (Keys) to CoinGecko IDs (Values)
const CRYPTO_IDS: Record<string, string> = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'SOL': 'solana',
    'KAS': 'kaspa',
    'BNB': 'binancecoin',
    'TRX': 'tron',
    'XRP': 'ripple'
};

// ==========================================
// LOGIC
// ==========================================

// Helper: Update a single rate in DB
const updateRateInDB = async (code: string, rate: number) => {
    try {
        await pool.execute(
            `UPDATE exchange_rates SET rate_to_bdt = ?, last_updated = NOW() WHERE currency_code = ?`,
            [rate, code]
        );
        // console.log(`[ORACLE] Updated ${code}: ${rate.toFixed(4)} BDT`); // Uncomment for debug
    } catch (error) {
        console.error(`[ORACLE] Failed to update ${code}`);
    }
};

// 1. Fetch FIAT Rates
export const updateFiatRates = async () => {
    try {
        console.log('[ORACLE] 🔄 Fetching Fiat Rates...');
        // API returns 1 BDT = X USD. We need 1 USD = Y BDT.
        const response = await axios.get(FIAT_API_URL);
        const rates = response.data.rates; 

        // Loop through all rates returned
        for (const [code, rateToBDT] of Object.entries(rates)) {
            const rate = Number(rateToBDT);
            
            // Avoid division by zero
            if (rate > 0) {
                // Calculate inverse: 1 Unit Foreign = (1 / Rate) BDT
                const bdtValue = 1 / rate; 
                await updateRateInDB(code, bdtValue);
            }
        }
        console.log('[ORACLE] ✅ Fiat Rates Updated.');
    } catch (error) {
        console.error('[ORACLE] ❌ Fiat Update Error:', (error as any).message);
    }
};

// 2. Fetch CRYPTO Rates
export const updateCryptoRates = async () => {
    try {
        console.log('[ORACLE] 🔄 Fetching Crypto Rates...');
        const ids = Object.values(CRYPTO_IDS).join(',');
        
        // Fetch price in BDT directly from CoinGecko
        const response = await axios.get(`${CRYPTO_API_URL}?ids=${ids}&vs_currencies=bdt`);
        const data = response.data; 

        for (const [symbol, apiId] of Object.entries(CRYPTO_IDS)) {
            // Check if data exists for this coin
            if (data[apiId] && data[apiId].bdt) {
                await updateRateInDB(symbol, data[apiId].bdt);
            }
        }
        console.log('[ORACLE] ✅ Crypto Rates Updated.');
    } catch (error) {
        // Handle Rate Limiting gracefully
        if (axios.isAxiosError(error) && error.response?.status === 429) {
            console.warn('[ORACLE] ⚠️ Rate Limit Hit (429). Skipping this update.');
        } else {
            console.error('[ORACLE] ❌ Crypto Update Error:', (error as any).message);
        }
    }
};

// ==========================================
// SCHEDULER (The "Cron Job")
// ==========================================
export const startCurrencyOracle = () => {
    console.log('🚀 Currency Oracle Started: Updating every 5 minutes');
    
    // 1. Run immediately on server start (so we don't wait 5 mins for first data)
    updateFiatRates();
    updateCryptoRates();

    // 2. Schedule: Run EVERY 5 MINUTES
    // Pattern: "*/5 * * * *" means "Every minute divisible by 5" (0, 5, 10...)
    cron.schedule('*/5 * * * *', () => {
        console.log(`\n[${new Date().toLocaleTimeString()}] ⏰ 5-Minute Sync Started...`);
        updateFiatRates();
        updateCryptoRates();
    });
};