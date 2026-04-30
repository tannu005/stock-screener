import express, { Request, Response } from 'express';
import axios from 'axios';

const router = express.Router();

// Get trending stocks (using Alpha Vantage or Finnhub)
router.get('/trending', async (req: Request, res: Response) => {
    try {
        // This is a placeholder - integrate with real APIs
        const mockStocks = [
            { symbol: 'AAPL', price: 195.5, change: 2.5, volume: 50000000 },
            { symbol: 'MSFT', price: 380.2, change: 1.8, volume: 30000000 },
            { symbol: 'GOOGL', price: 140.8, change: -0.5, volume: 25000000 },
            { symbol: 'AMZN', price: 178.5, change: 3.2, volume: 40000000 },
            { symbol: 'NVDA', price: 875.3, change: 5.1, volume: 35000000 },
        ];

        res.json({ stocks: mockStocks });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get stock quote
router.get('/:symbol', async (req: Request, res: Response) => {
    try {
        const { symbol } = req.params;

        // Placeholder - integrate with real API
        const mockQuote = {
            symbol,
            price: Math.random() * 500,
            change: (Math.random() - 0.5) * 10,
            volume: Math.floor(Math.random() * 100000000),
        };

        res.json(mockQuote);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
