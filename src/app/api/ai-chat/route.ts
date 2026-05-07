import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message, role } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const systemPrompt = role === 'employer'
      ? 'You are a helpful business assistant for employers on the MazdoorPing platform in Pakistan. Provide advice in the same language the user writes in (Urdu or English). Keep responses practical and concise. Help with hiring strategies, worker management, project planning, and business growth.'
      : 'You are a helpful career assistant for Pakistani skilled workers on the MazdoorPing platform. Provide advice in the same language the user writes in (Urdu or English). Keep responses practical and concise. Help with finding work, improving skills, career advice, and workplace safety.';

    const ZAI = (await import('z-ai-web-dev-sdk')).default;

    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      max_tokens: 500,
    });

    const aiContent = completion.choices?.[0]?.message?.content || 'Sorry, I could not generate a response. Please try again.';

    return NextResponse.json({ content: aiContent });
  } catch (error) {
    console.error('AI Chat error:', error);
    return NextResponse.json(
      { content: 'Sorry, I am having trouble responding right now. Please try again in a moment.' },
      { status: 200 }
    );
  }
}
