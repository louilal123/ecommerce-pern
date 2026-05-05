import { Router, Request, Response } from 'express';
import { stripe } from '../lib/stripe';
import { supabaseAdmin } from '../lib/supabase';

const router = Router();

// Middleware to verify Supabase JWT from Authorization header
const requireAuth = async (req: Request, res: Response, next: Function) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid token' });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
        return res.status(401).json({ error: 'Invalid token' });
    }

    // Attach user info to request for later use
    (req as any).user = user;
    next();
};

router.post('/', requireAuth, async (req: Request, res: Response) => {
    try {
        const user = (req as any).user; // from middleware
        const { items } = req.body;

        if (!items?.length) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

        // Build line items (plain objects – no explicit type annotation)
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

        // Create a pending order in Supabase
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


export default router;