import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!supabaseUrl) throw new Error('SUPABASE_URL is not configured');
  return createClient(supabaseUrl, supabaseAnonKey);
}

// GET /api/chat — Fetch conversations for the current user
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase();
    // Get the user's token from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify the user with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get user role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = profile?.role;
    if (!role || (role !== 'worker' && role !== 'employer')) {
      return NextResponse.json({ error: 'Unauthorized role' }, { status: 403 });
    }

    // Fetch conversations based on role
    const column = role === 'worker' ? 'worker_id' : 'employer_id';
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('*')
      .eq(column, user.id)
      .order('last_message_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching conversations:', error.message);
      // Return empty array instead of error for graceful degradation
      return NextResponse.json({ conversations: [] });
    }

    return NextResponse.json({
      conversations: conversations || [],
    });
  } catch (err) {
    console.error('Chat GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/chat — Send a new message
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { conversationId, content, type = 'text' } = body;

    if (!conversationId || !content?.trim()) {
      return NextResponse.json(
        { error: 'conversationId and content are required' },
        { status: 400 }
      );
    }

    // Verify user belongs to this conversation
    const { data: conv } = await supabase
      .from('conversations')
      .select('worker_id, employer_id')
      .eq('id', conversationId)
      .single();

    if (!conv) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    if (conv.worker_id !== user.id && conv.employer_id !== user.id) {
      return NextResponse.json({ error: 'Not authorized for this conversation' }, { status: 403 });
    }

    // Insert the message
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: content.trim(),
        type,
      })
      .select()
      .single();

    if (error) {
      console.error('Error sending message:', error.message);
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }

    // Update conversation's last_message_at
    await supabase
      .from('conversations')
      .update({
        last_message: content.trim(),
        last_message_at: new Date().toISOString(),
      })
      .eq('id', conversationId);

    return NextResponse.json({ message });
  } catch (err) {
    console.error('Chat POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
