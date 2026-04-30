import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { validationResult, body } from 'express-validator';
import { User } from '../models/User.js';

const router = express.Router();

// Validation middleware
const validateSignup = [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').trim().notEmpty(),
];

// Sign Up
router.post(
    '/signup',
    validateSignup,
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email, password, name } = req.body;

            // Check if user exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(409).json({ error: 'Email already registered' });
            }

            // Create new user
            const user = new User({ email, password, name });
            await user.save();

            // Generate JWT
            const token = jwt.sign(
                { id: user._id, email: user.email, name: user.name },
                process.env.JWT_SECRET || 'secret',
                { expiresIn: process.env.JWT_EXPIRE || '7d' }
            );

            res.status(201).json({
                message: 'User created successfully',
                token,
                user: { id: user._id, email: user.email, name: user.name },
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
);

// Sign In
router.post(
    '/signin',
    [
        body('email').isEmail().normalizeEmail(),
        body('password').notEmpty(),
    ],
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email, password } = req.body;

            // Find user
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Compare password
            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Generate JWT
            const token = jwt.sign(
                { id: user._id, email: user.email, name: user.name },
                process.env.JWT_SECRET || 'secret',
                { expiresIn: process.env.JWT_EXPIRE || '7d' }
            );

            res.json({
                message: 'Signed in successfully',
                token,
                user: { id: user._id, email: user.email, name: user.name },
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
);

export default router;
