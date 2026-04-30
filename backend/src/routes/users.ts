import express, { Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get user profile
router.get('/profile', authMiddleware, (req: Request, res: Response) => {
    res.json({ user: (req as any).user });
});

export default router;
