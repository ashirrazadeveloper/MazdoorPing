import { NextRequest, NextResponse } from 'next/server';

// Force Node.js runtime for SDK compatibility
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let zaiInstance: any = null;
let zaiInitAttempted = false;

async function importZAI() {
  try {
    const mod = await import('z-ai-web-dev-sdk');
    const ZAI = (mod as any).default || (mod as any).ZAI || mod;
    const instance = await ZAI.create();
    return instance;
  } catch (err) {
    console.error('ZAI import/create error:', err);
    return null;
  }
}

async function getZAI() {
  if (zaiInitAttempted && zaiInstance) return zaiInstance;
  if (zaiInitAttempted && !zaiInstance) return null;

  zaiInitAttempted = true;
  try {
    zaiInstance = await importZAI();
    if (zaiInstance) {
      console.log('ZAI SDK initialized successfully');
    } else {
      console.warn('ZAI SDK returned null instance');
    }
    return zaiInstance;
  } catch (err) {
    console.error('ZAI init error:', err);
    return null;
  }
}

// Intelligent fallback response system for when SDK is unavailable
function generateFallbackResponse(message: string, role: string): string {
  const msg = message.toLowerCase();

  if (role === 'employer') {
    if (msg.includes('job') && (msg.includes('post') || msg.includes('write') || msg.includes('create') || msg.includes('how'))) {
      return "To create an effective job posting on MazdoorPing:\n\n1. **Title**: Use clear, specific titles like '3-Bedroom House Wiring' instead of just 'Electrician Needed'\n2. **Budget**: Set realistic budgets based on market rates in your city\n3. **Description**: Include scope of work, materials needed, timeline expectations\n4. **Location**: Be specific about the area and accessibility\n5. **Urgency**: Mark urgency level correctly to attract the right workers\n\nWorkers respond 40% faster to jobs with detailed descriptions and clear budgets. Would you like tips for any specific trade category?";
    }
    if (msg.includes('worker') && (msg.includes('find') || msg.includes('hire') || msg.includes('best') || msg.includes('good'))) {
      return "Here are tips for finding the best workers on MazdoorPing:\n\n1. **Check Ratings**: Look for workers with 4.0+ ratings and at least 5 completed jobs\n2. **Review Portfolios**: Top workers showcase their previous work in their portfolio\n3. **Verify Skills**: Check their verified skills and badges\n4. **Read Reviews**: Previous employer reviews give you real insights\n5. **Use Filters**: Filter by city, skill, rating, and availability\n\nYou can also use the AI Recommendations feature to get matched with the most suitable workers for your project. Would you like more specific hiring advice?";
    }
    if (msg.includes('price') || msg.includes('budget') || msg.includes('cost') || msg.includes('rate') || msg.includes('how much')) {
      return "Here are average market rates across Pakistan for common jobs:\n\n**Electrician**:\n- House Wiring: PKR 15,000 - 50,000\n- AC Repair: PKR 3,000 - 8,000\n- Fan Installation: PKR 500 - 1,500\n\n**Plumber**:\n- Bathroom Renovation: PKR 15,000 - 35,000\n- Geyser Installation: PKR 5,000 - 10,000\n- Pipe Repair: PKR 2,000 - 5,000\n\n**Carpenter**:\n- Door Installation: PKR 8,000 - 20,000\n- Kitchen Cabinets: PKR 25,000 - 65,000\n- Furniture Assembly: PKR 5,000 - 15,000\n\nPrices vary by city. Karachi and Lahore are typically 10-20% higher. Always discuss scope clearly before finalizing budgets.";
    }
    if (msg.includes('pay') || msg.includes('payment') || msg.includes('wallet') || msg.includes('money') || msg.includes('transaction')) {
      return "MazdoorPing Payment System Guide:\n\n1. **MazdoorPing Wallet**: Load your wallet via JazzCash, EasyPaisa, or bank transfer\n2. **Secure Payments**: Payments are held in escrow until you confirm job completion\n3. **Invoicing**: Automatic invoices generated for every completed job\n4. **Refunds**: If a job isn't completed satisfactorily, raise a dispute within 48 hours\n5. **Tax**: A 10% platform commission applies on all transactions\n\nYour money is safe with MazdoorPing! We ensure workers only get paid after you're satisfied with the work.";
    }
    if (msg.includes('safety') || msg.includes('verify') || msg.includes('authentic') || msg.includes('trust')) {
      return "MazdoorPing ensures worker authenticity through:\n\n1. **CNIC Verification**: Every worker's CNIC is verified by our admin team\n2. **Skill Badges**: Workers earn verified skill badges after demonstrating expertise\n3. **Rating System**: Real reviews from real employers\n4. **Background Checks**: Admin verification process for all new workers\n5. **SOS Alert System**: Workers can trigger emergency alerts for safety\n\nYou can check verification status on any worker's profile. Look for the verified badge (green checkmark) for maximum assurance.";
    }
    return "As your MazdoorPing business assistant, I can help you with:\n\n- **Job Posting**: Tips for writing effective job descriptions\n- **Finding Workers**: How to filter and select the best workers\n- **Budget Guidance**: Market rate information for different trades\n- **Payment Support**: Wallet, invoicing, and transaction help\n- **Project Planning**: Timeline and scope management tips\n- **Worker Management**: Tips for managing ongoing projects\n\nPlease ask me about any of these topics and I'll give you detailed, practical advice for the Pakistani market!";
  }

  // Worker responses
  if (msg.includes('profile') || msg.includes('improve') || msg.includes('better')) {
    return "Here's how to improve your MazdoorPing profile:\n\n1. **Complete Your Profile**: Add all skills, experience years, and bio. Complete profiles get 3x more job offers\n2. **Professional Photo**: Add a clear, professional profile photo\n3. **Portfolio**: Upload photos of your best work with descriptions\n4. **Bio**: Write a compelling bio that highlights your expertise and reliability\n5. **Badges**: Earn skill badges by completing jobs and getting good reviews\n6. **Ratings**: Always deliver quality work - your rating is your biggest asset\n\nWorkers with complete profiles and 10+ portfolio items earn 60% more on average!";
  }
  if (msg.includes('price') || msg.includes('rate') || msg.includes('charge') || msg.includes('earn') || msg.includes('how much')) {
    return "Here are current market rates to help you set competitive pricing:\n\n**Electrician**: PKR 800-1,500/hour or PKR 15,000-50,000 per project\n**Plumber**: PKR 700-1,200/hour or PKR 10,000-35,000 per project\n**Carpenter**: PKR 900-1,800/hour or PKR 12,000-65,000 per project\n**Painter**: PKR 600-1,000/hour or PKR 8,000-30,000 per project\n**AC Technician**: PKR 800-1,500/hour or PKR 3,000-15,000 per job\n**Mason**: PKR 700-1,200/hour or PKR 15,000-50,000 per project\n\nTips:\n- Start slightly below market rate to build reviews\n- Raise rates after 10+ positive reviews\n- Factor in travel costs for distant locations\n- Higher-rated workers can charge 20-30% premium";
  }
  if (msg.includes('review') || msg.includes('rating') || msg.includes('feedback')) {
    return "Building great reviews on MazdoorPing:\n\n**Get 5-Star Reviews**:\n1. Always arrive on time - punctuality is rated highly\n2. Communicate clearly about timeline and any issues\n3. Clean up after work - employers love tidy workers\n4. Go the extra mile - small touches make a big difference\n5. Confirm completion before leaving the job site\n\n**Handling Negative Reviews**:\n- Stay professional in your response\n- Contact the employer to resolve the issue\n- Admin can help mediate disputes\n- Focus on getting new positive reviews to improve your average\n\nA 4.5+ rating puts you in the top 15% of MazdoorPing workers!";
  }
  if (msg.includes('skill') || msg.includes('learn') || msg.includes('training') || msg.includes('certificate')) {
    return "Boost your skills and earnings on MazdoorPing:\n\n**High-Demand Skills**:\n1. Solar Panel Installation - Growing fast in Pakistan\n2. Smart Home Automation - Premium rates\n3. AC Inverter Repair - Year-round demand\n4. Modular Kitchen Work - High-value projects\n5. Plumbing & Electrical Combo - More job opportunities\n\n**Free Training Resources**:\n- TEVTA (Technical Education & Vocational Training Authority)\n- NAVTTC free courses\n- YouTube tutorials for specific techniques\n- Learn from experienced workers on MazdoorPing\n\nAdd new skills to your profile - workers with 3+ skills get 40% more job invites!";
  }
  if (msg.includes('safety') || msg.includes('danger') || msg.includes('accident') || msg.includes('sos')) {
    return "Your safety is priority on MazdoorPing:\n\n**SOS Alert System**:\n- One-tap emergency button sends your live location to admins\n- Admin team monitors alerts 24/7\n- Emergency contacts are notified automatically\n\n**Workplace Safety Tips**:\n1. Always use proper safety equipment (gloves, goggles, helmet)\n2. Turn off electricity before electrical work\n3. Use proper tools for each job\n4. Don't work alone on dangerous tasks\n5. Stay hydrated during summer work\n6. Know the nearest hospital location\n\n**Insurance**: MazdoorPing is working on worker insurance coverage. Until then, we recommend getting personal accident insurance (available for PKR 500-1,500/year).";
  }
  if (msg.includes('job') && (msg.includes('get') || msg.includes('find') || msg.includes('more') || msg.includes('bid'))) {
    return "Get more jobs on MazdoorPing:\n\n1. **Complete Profile**: 100% complete profiles appear first in search results\n2. **Quick Responses**: Respond to job invites within 1 hour - fast responders get hired 3x more\n3. **Competitive Bids**: Don't always bid the lowest - show value in your proposal\n4. **Portfolio**: Upload quality photos of your best work\n5. **Availability**: Keep your availability updated - available workers get priority\n6. **Ratings**: Maintain 4.0+ rating for featured job access\n7. **Recommendations**: Check the Recommendations tab for AI-matched jobs\n8. **Nearby Jobs**: Enable location for nearby job alerts\n\nWorkers who follow these tips see a 70% increase in job invitations!";
  }
  return "As your MazdoorPing career assistant, I'm here to help you succeed! I can provide advice on:\n\n- **Finding More Jobs**: Bidding tips, profile optimization, visibility boosting\n- **Pricing Strategy**: Market rates, how to set competitive prices\n- **Skill Development**: High-demand skills, training resources, certifications\n- **Profile Improvement**: How to stand out and attract employers\n- **Reviews & Ratings**: How to get 5-star reviews consistently\n- **Safety & Security**: Workplace safety tips, SOS system guidance\n- **Earnings & Wallet**: Payment help, invoicing, withdrawal tips\n- **Career Growth**: Building your reputation, earning badges\n\nPlease ask about any of these topics for detailed, practical advice!";
}

export async function POST(request: NextRequest) {
  try {
    const { message, role, lang } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const isUrdu = lang === 'ur' || (message && /[\u0600-\u06FF]/.test(message.substring(0, 50)));

    const systemPrompt = role === 'employer'
      ? `You are a helpful business assistant for employers on the MazdoorPing platform in Pakistan. MazdoorPing is a platform connecting skilled workers (electricians, plumbers, carpenters, painters, AC technicians, masons, welders, laborers) with employers. ${isUrdu ? 'Respond in Urdu (Roman Urdu or Urdu script as user prefers).' : 'Respond in English.'} Provide practical, concise advice about hiring strategies, worker management, project planning, budgeting, and business growth. Reference specific Pakistani market conditions, rates in PKR, and local cities (Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, Quetta). Keep responses to 3-5 paragraphs max.`
      : `You are a helpful career assistant for Pakistani skilled workers on the MazdoorPing platform. MazdoorPing connects skilled workers with employers for various construction and home services jobs. ${isUrdu ? 'Respond in Urdu (Roman Urdu or Urdu script as user prefers).' : 'Respond in English.'} Provide practical, concise advice about finding work, improving skills, pricing strategies, workplace safety, profile building, getting good reviews, and career growth. Reference specific Pakistani market conditions, rates in PKR, and local cities. Keep responses to 3-5 paragraphs max.`;

    // Try ZAI SDK first
    const zai = await getZAI();

    if (zai) {
      try {
        const completion = await zai.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message },
          ],
          max_tokens: 800,
        });

        const aiContent = completion?.choices?.[0]?.message?.content;
        if (aiContent && aiContent.length > 10) {
          return NextResponse.json({ content: aiContent });
        }
      } catch (sdkErr) {
        console.error('ZAI SDK call error, using fallback:', sdkErr);
        // Fall through to fallback
      }
    }

    // Fallback: intelligent rule-based responses
    const fallbackResponse = generateFallbackResponse(message, role || 'worker');
    return NextResponse.json({ content: fallbackResponse });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('AI Chat error:', msg);
    // Always return a helpful fallback response - never crash
    return NextResponse.json({
      content: 'Mujhe abhi technical issue aa raha hai. MazdoorPing platform ke baare mein aap ka sawaal samajh gaya hoon. Kuch common topics mein madad kar sakta hoon:\n\n- Profile improve karna\n- Job finding tips\n- Budget/rates guidance\n- Payment & wallet help\n- Safety tips\n\nPlease specific sawaal poochein, main zaroor madad karunga!',
    }, { status: 200 });
  }
}
