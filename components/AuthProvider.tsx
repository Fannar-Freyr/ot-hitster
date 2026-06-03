'use client';
import { useEffect } from 'react';
import { supabase } from '@/utils/db/supabase';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.provider_token) {
        localStorage.setItem('spotifyToken', session.provider_token);
        localStorage.setItem('spotifyTokenStoredAt', String(Date.now()));
      }
      if (session?.provider_refresh_token) {
        localStorage.setItem('spotifyRefreshToken', session.provider_refresh_token);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return <>{children}</>;
}
