import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
    error: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error('Error:', error);

    if (error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message });
    }

    if (error.name === 'MongoError' && error.code === 11000) {
        return res.status(409).json({ error: 'Email already exists' });
    }

    res.status(error.status || 500).json({
        error: error.message || 'Internal server error',
    });
};
