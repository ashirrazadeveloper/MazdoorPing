import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

async function getServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({name, value, options}) => cookieStore.set(name, value, options)); } catch {}
        },
      },
    }
  );
}

export async function POST(request: NextRequest) {
  try {
    const client = await getServerClient();
    const body = await request.json();
    const { settings, category } = body;
    if (!settings || !Array.isArray(settings) || settings.length === 0) {
      return NextResponse.json({ error: 'Settings array is required' }, { status: 400 });
    }
    const upserts = settings.map((s: { key: string; value: string }) => ({
      key: s.key,
      value: s.value,
      category: category || 'general',
    }));
    const { error } = await client.from('platform_settings').upsert(upserts, { onConflict: 'key,category' });
    if (error) {
      console.error('Upsert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, count: upserts.length });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET() {
  try {
    const client = await getServerClient();
    const { data, error } = await client.from('platform_settings').select('*');
    if (error) throw error;
    return NextResponse.json({ data: data || [] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
