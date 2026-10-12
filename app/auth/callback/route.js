import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const errorParam = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Determine base URL (accounting for reverse proxy / load balancer headers)
  const forwardedHost = request.headers.get('x-forwarded-host');
  const isLocalEnv = process.env.NODE_ENV === 'development';
  const baseUrl = isLocalEnv
    ? origin
    : forwardedHost
    ? `https://${forwardedHost}`
    : origin;

  // Sanitize next redirect target to prevent open redirects
  let rawNext = searchParams.get('next') ?? '/dashboard';
  if (!rawNext.startsWith('/') || rawNext.startsWith('//') || rawNext.includes(':')) {
    rawNext = '/dashboard';
  }

  if (errorParam) {
    const errorMsg = encodeURIComponent(errorDescription || errorParam);
    return NextResponse.redirect(`${baseUrl}/sign-in?error=${errorMsg}`);
  }

  if (code) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error && data?.session) {
        const redirectResponse = NextResponse.redirect(`${baseUrl}${rawNext}`);
        // Ensure user session cookie is attached
        redirectResponse.cookies.set('prepsmart_user_session', 'true', {
          path: '/',
          maxAge: 604800,
          sameSite: 'lax',
        });
        return redirectResponse;
      }
      if (error) {
        console.error('Supabase code exchange error:', error);
        return NextResponse.redirect(
          `${baseUrl}/sign-in?error=${encodeURIComponent(error.message || 'auth_callback_failed')}`
        );
      }
    } catch (e) {
      console.error('Error exchanging auth code:', e);
    }
  }

  return NextResponse.redirect(`${baseUrl}/sign-in?error=auth_callback_failed`);
}
