import axios from 'axios';
import cron from 'node-cron';
import pool from '../config/database'; // Ensure this matches your path (../config/database)

// ==========================================
// CONFIGURATION
// ==========================================
// 1. Fiat Source: Open Exchange Rates (Free Endpoint)
const FIAT_API_URL = 'https://api.exchangerate-api.com/v4/latest/BDT';

// 2. Crypto Source: CoinGecko (Free Public API)
const CRYPTO_API_URL = 'https://api.coingecko.com/api/v3/simple/price';
const CRYPTO_IDS = {
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
        console.log(`[ORACLE] Updated ${code}: ${rate.toFixed(4)} BDT`);
    } catch (error) {
        console.error(`[ORACLE] Failed to update ${code}`, error);
    }
};

// 1. Fetch FIAT Rates
export const updateFiatRates = async () => {
    try {
        console.log('[ORACLE] Fetching Live Fiat Rates...');
        // We get rates relative to BDT (Base)
        const response = await axios.get(FIAT_API_URL);
        const rates = response.data.rates; // e.g., { USD: 0.0083, EUR: 0.0076 }

        // Math: If 1 BDT = 0.0083 USD, then 1 USD = 1 / 0.0083 BDT
        for (const [code, rateToBDT] of Object.entries(rates)) {
            // We only update currencies that exist in our DB to save resources
            const rate = Number(rateToBDT);
            if (rate > 0) {
                const bdtValue = 1 / rate; 
                await updateRateInDB(code, bdtValue);
            }
        }
    } catch (error) {
        console.error('[ORACLE] Fiat Update Error:', error);
    }
};

// 2. Fetch CRYPTO Rates
export const updateCryptoRates = async () => {
    try {
        console.log('[ORACLE] Fetching Live Crypto Rates...');
        const ids = Object.values(CRYPTO_IDS).join(',');
        
        // Fetch price in BDT directly
        const response = await axios.get(`${CRYPTO_API_URL}?ids=${ids}&vs_currencies=bdt`);
        const data = response.data; // e.g., { bitcoin: { bdt: 12000000 } }

        for (const [symbol, apiId] of Object.entries(CRYPTO_IDS)) {
            if (data[apiId] && data[apiId].bdt) {
                await updateRateInDB(symbol, data[apiId].bdt);
            }
        }
    } catch (error) {
        console.error('[ORACLE] Crypto Update Error:', error);
    }
};

// ==========================================
// SCHEDULER (The "Cron Job")
// ==========================================
export const startCurrencyOracle = () => {
    console.log('🚀 Currency Oracle Started: Updating every 1 hour');
    
    // Run immediately on server start
    updateFiatRates();
    updateCryptoRates();

    
    // Schedule: Run EVERY 1 MINUTE
    cron.schedule('* * * * *', () => {
        console.log('⏰ Minute Sync: Updating All Currencies...');
        updateFiatRates();
        updateCryptoRates();
    });
};