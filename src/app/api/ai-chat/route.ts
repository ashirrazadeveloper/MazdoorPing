import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering (Node.js runtime) for SDK compatibility
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let zaiInstance: any = null;
let initError: string | null = null;

async function getZAI() {
  if (zaiInstance) return zaiInstance;
  if (initError) return null;

  try {
    const { default: ZAI } = await import('z-ai-web-dev-sdk');
    zaiInstance = await ZAI.create();
    return zaiInstance;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    initError = msg;
    console.error('ZAI init error:', msg);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, role } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const systemPrompt = role === 'employer'
      ? 'You are a helpful business assistant for employers on the MazdoorPing platform in Pakistan. Provide advice in the same language the user writes in (Urdu or English). Keep responses practical and concise. Help with hiring strategies, worker management, project planning, and business growth.'
      : 'You are a helpful career assistant for Pakistani skilled workers on the MazdoorPing platform. Provide advice in the same language the user writes in (Urdu or English). Keep responses practical and concise. Help with finding work, improving skills, career advice, and workplace safety.';

    const zai = await getZAI();

    if (!zai) {
      console.error('AI Chat: ZAI SDK not available');
      return NextResponse.json({
        content: 'AI service is currently unavailable. Please try again later.',
      });
    }

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      max_tokens: 500,
    });

    const aiContent = completion.choices?.[0]?.message?.content || 'Sorry, I could not generate a response. Please try again.';

    return NextResponse.json({ content: aiContent });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('AI Chat error:', msg);
    return NextResponse.json(
      { content: 'Sorry, I am having trouble responding right now. Please try again in a moment.' },
      { status: 200 }
    );
  }
}
