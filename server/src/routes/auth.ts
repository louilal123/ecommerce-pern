// server/src/routes/auth.ts
import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase';
import nodemailer from 'nodemailer';

const router = Router();

// Nodemailer transporter (force IPv4)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    connection: {
        family: 4,
    },
} as nodemailer.TransportOptions);

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

    // Send via Nodemailer
    try {
        await transporter.sendMail({
            from: `"Lecommerce Admin" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Your login verification code',
            text: `Your verification code is: ${code}. It expires in 5 minutes.`,
            html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:#f4f4f5; font-family: Arial, Helvetica, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0d9488, #14b8a6); padding: 30px 20px; text-align: center;">
              <h1 style="margin:0; color:#ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">LECOMMERCE</h1>
              <p style="margin:4px 0 0; color: rgba(255,255,255,0.85); font-size: 14px;">Verification Code</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 30px 24px;">
              <p style="margin:0 0 16px; font-size: 16px; color: #1f2937; line-height: 1.5;">
                Hello,
              </p>
              <p style="margin:0 0 24px; font-size: 14px; color: #4b5563; line-height: 1.6;">
                Use the 6‑digit code below to complete your sign‑in. This code expires in <strong>5 minutes</strong>.
              </p>
              <!-- Code box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; background-color: #f0fdfa; border: 1px dashed #0d9488; border-radius: 8px; padding: 20px 30px;">
                      <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #0d9488; font-family: 'Courier New', monospace;">${code}</span>
                    </div>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px; font-size: 13px; color: #9ca3af;">
                If you didn’t request this code, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 16px 24px; text-align: center; border-top: 1px solid #f3f4f6;">
              <p style="margin:0; font-size: 12px; color: #9ca3af;">
                © ${new Date().getFullYear()} Lecommerce. All rights reserved.
              </p>
              <p style="margin:4px 0 0; font-size: 11px; color: #d1d5db;">
                Need help? Contact support@lecommerce.com
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`,
        });
        res.json({ success: true });
    } catch (err) {
        console.error('Nodemailer error:', err);
        res.status(500).json({ error: 'Failed to send email' });
    }
});

// 2. Verify OTP
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