import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Lazy-init client to avoid build-time crashes when env vars are missing
function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!supabaseUrl) throw new Error('SUPABASE_URL is not configured');
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function POST(request: NextRequest) {
  try {
    const adminClient = getAdminClient();
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

    const { error } = await adminClient
      .from('platform_settings')
      .upsert(upserts, { onConflict: 'key,category' });

    if (error) {
      console.error('Upsert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: upserts.length });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('Platform settings save error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET() {
  try {
    const adminClient = getAdminClient();
    const { data, error } = await adminClient
      .from('platform_settings')
      .select('*');

    if (error) throw error;

    return NextResponse.json({ data: data || [] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
