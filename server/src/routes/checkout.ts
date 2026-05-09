import { Router, Request, Response } from 'express';
import { stripe } from '../lib/stripe';
import { supabaseAdmin, supabaseAuthClient } from '../lib/supabase';

const router = Router();

// Middleware to verify the user's JWT (uses the auth-only client)
const requireAuth = async (req: Request, res: Response, next: Function) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid token' });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabaseAuthClient.auth.getUser(token);

    if (error || !user) {
        return res.status(401).json({ error: 'Invalid token' });
    }

    // Attach user info to the request for later use
    (req as any).user = user;
    next();
};

// POST /api/create-checkout-session
router.post('/', requireAuth, async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const { items } = req.body;

        if (!items?.length) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

        // Build line items (plain objects – no explicit type annotation needed)
        const lineItems = items.map((item: any) => ({
            price_data: {
                currency: 'php',
                product_data: {
                    name: item.product_name,
                    description: item.variant_description || '',
                },
                unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity,
        }));

        const totalInCents = lineItems.reduce(
            (sum: number, li: any) => sum + (li.price_data?.unit_amount ?? 0) * li.quantity,
            0
        );

        // Create a pending order in Supabase (uses admin client – bypasses RLS)
        const { data: order, error: orderError } = await supabaseAdmin
            .from('orders')
            .insert({
                user_id: user.id,
                status: 'pending',
                total_amount: totalInCents / 100,
            })
            .select()
            .single();

        if (orderError || !order) {
            console.error('Order creation error:', orderError);
            return res.status(500).json({ error: 'Could not create order' });
        }

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/order/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/cart`,
            customer_email: user.email,
            metadata: {
                order_id: order.id,
                user_id: user.id,
            },
        });

        // Save the Stripe session ID on the order
        await supabaseAdmin
            .from('orders')
            .update({ stripe_session_id: session.id })
            .eq('id', order.id);

        res.json({ url: session.url });
    } catch (error: any) {
        console.error('Checkout error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// REMOVE THIS DEBUG ROUTE AFTER CONFIRMING THE FIX
router.get('/check-key', async (_req, res) => {
    res.json({
        url: process.env.SUPABASE_URL,
        keyPrefix: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 10),
        keyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length,
    });
});

// TEMP: test admin insert directly
router.get('/test-admin-insert', async (_req, res) => {
    const { data, error } = await supabaseAdmin
        .from('orders')
        .insert({
            user_id: '00000000-0000-0000-0000-000000000000',
            status: 'pending',
            total_amount: 0,
        })
        .select()
        .single();

    if (error) {
        console.error('Test insert error:', error);
        return res.status(500).json({ error: error.message, code: error.code });
    }

    await supabaseAdmin.from('orders').delete().eq('id', data.id);
    res.json({ success: true, message: 'Admin insert works' });
});

export default router;