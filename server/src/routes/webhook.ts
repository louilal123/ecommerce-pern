// server/src/routes/webhook.ts
import express, { Router, Request, Response } from 'express';   // ← import express
import { stripe } from '../lib/stripe';
import { supabaseAdmin } from '../lib/supabase';

const router = Router();

router.post(
    '/',
    express.raw({ type: 'application/json' }),   // ← now express is defined
    async (req: Request, res: Response) => {
        // ... rest unchanged
    }
);

export default router;