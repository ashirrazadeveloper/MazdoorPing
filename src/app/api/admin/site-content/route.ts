import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

async function getServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

export async function GET(request: NextRequest) {
  try {
    const client = await getServerClient();
    const { searchParams } = new URL(request.url);
    const pageSlug = searchParams.get('page_slug');

    let query = client.from('site_content').select('*');
    if (pageSlug) {
      query = query.eq('page_slug', pageSlug);
    }
    query = query.order('sort_order', { ascending: true });

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ data: data || [] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const client = await getServerClient();
    const body = await request.json();
    const { content } = body;

    if (!content || !Array.isArray(content) || content.length === 0) {
      return NextResponse.json({ error: 'Content array is required' }, { status: 400 });
    }

    // Map frontend content types to database-allowed values
    // Frontend uses: 'text', 'textarea', 'url'
    // DB CHECK allows: 'text', 'richtext', 'html', 'json'
    const typeMap: Record<string, string> = {
      text: 'text',
      textarea: 'text',
      url: 'text',
      richtext: 'richtext',
      html: 'html',
      json: 'json',
    };

    const rows = content.map((item: {
      page_slug: string;
      section_key: string;
      content_en: string;
      content_ur: string;
      content_type?: string;
      sort_order?: number;
    }) => ({
      page_slug: item.page_slug,
      section_key: item.section_key,
      content_en: item.content_en,
      content_ur: item.content_ur,
      content_type: typeMap[item.content_type || 'text'] || 'text',
      sort_order: item.sort_order ?? 0,
    }));

    const { error } = await client
      .from('site_content')
      .upsert(rows, { onConflict: 'page_slug,section_key' });

    if (error) {
      console.error('Upsert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: rows.length });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const client = await getServerClient();
    const body = await request.json();
    const { id, ...fields } = body;

    if (!id) {
      return NextResponse.json({ error: 'Content id is required' }, { status: 400 });
    }

    const { error } = await client
      .from('site_content')
      .update(fields)
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const client = await getServerClient();
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Content id is required' }, { status: 400 });
    }

    const { error } = await client
      .from('site_content')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
