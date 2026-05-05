import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import webhookRouter from './routes/webhook';
import checkoutRouter from './routes/checkout';

const app = express();
const PORT = process.env.PORT || 3000;

// Webhook route must be registered before the global JSON parser
app.use('/api/stripe-webhook', webhookRouter);

// Global middleware (applied after webhook)
app.use(express.json());
app.use(
    cors({
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true,
    })
);

// Other API routes
app.use('/api/create-checkout-session', checkoutRouter);

// Health check
app.get('/api/health', (_req, res) => res.send('OK'));

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});