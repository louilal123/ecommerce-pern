import { createClient } from '@supabase/supabase-js';

// Admin client – ONLY for database queries (bypasses RLS)
export const supabaseAdmin = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

// Auth‑only client – ONLY for verifying user JWT tokens
// Must be separate to avoid contaminating supabaseAdmin’s session
export const supabaseAuthClient = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
);