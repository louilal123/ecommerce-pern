import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useAdmin() {
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null); // null = loading

    useEffect(() => {
        let cancelled = false;
        const check = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                if (!cancelled) setIsAdmin(false);
                return;
            }
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (!cancelled) {
                setIsAdmin(profile?.role === 'admin');
            }
        };
        check();
        return () => { cancelled = true; };
    }, []);

    return isAdmin;
}