import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase';
import { Resend } from 'resend';

const router = Router();
const resend = new Resend(process.env.RESEND_API_KEY);

// 1. Send OTP
router.post('/send-otp', async (req: Request, res: Response) => {
    const { userId, email } = req.body;
    if (!userId || !email) return res.status(400).json({ error: 'Missing userId or email' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP to database
    const { error: insertError } = await supabaseAdmin.from('admin_otp_codes').insert({
        user_id: userId,
        code,
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    });
    if (insertError) {
        console.error('OTP insert error:', insertError);
        return res.status(500).json({ error: 'Could not save OTP' });
    }

    // Send via Resend
    try {
        await resend.emails.send({
            from: 'Lecommerce Admin <admin@yourdomain.com>', // must be a verified domain
            to: email,
            subject: 'Your admin login verification code',
            text: `Your verification code is: ${code}. It expires in 5 minutes.`,
            html: `<p>Your verification code is: <strong>${code}</strong></p><p>This code expires in 5 minutes.</p>`,
        });
        res.json({ success: true });
    } catch (err) {
        console.error('Resend error:', err);
        res.status(500).json({ error: 'Failed to send email' });
    }
});

// 2. Verify OTP (unchanged)
router.post('/verify-otp', async (req: Request, res: Response) => {
    const { userId, code } = req.body;
    const { data, error } = await supabaseAdmin
        .from('admin_otp_codes')
        .select('*')
        .eq('user_id', userId)
        .eq('code', code)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (error || !data) {
        return res.status(400).json({ valid: false, error: 'Invalid or expired code' });
    }

    await supabaseAdmin.from('admin_otp_codes').delete().eq('id', data.id);
    res.json({ valid: true });
});

export default router;