import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { step, data, accessToken } = body;

    let userId: string | undefined;
    let db = await createSupabaseServerClient();

    // Try server-side auth first (cookie-based session)
    try {
      const { data: { user }, error: authError } = await db.auth.getUser();
      if (!authError && user) {
        userId = user.id;
      }
    } catch {
      // Server auth failed, try client token
    }

    // Fallback: use client-side access token from request body
    if (!userId && accessToken) {
      try {
        const clientSupabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || '',
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        );
        const { data: { user } } = await clientSupabase.auth.getUser(accessToken);
        if (user) {
          userId = user.id;
          db = clientSupabase;
        }
      } catch {
        // Token auth failed
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated. Please log out and log in again.' }, { status: 401 });
    }

    // ── Step 1: Personal Information → update profiles table ──
    if (step === 1 && data) {
      const { error } = await db
        .from('profiles')
        .update({
          full_name: data.fullName?.trim() || null,
          phone: data.phone?.trim() || null,
          avatar_url: data.avatarUrl || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    // ── Step 2: Business Details → update / insert employers table ──
    if (step === 2 && data) {
      const employerPayload = {
        company_name: data.companyName?.trim() || null,
        company_type: data.companyType?.trim() || null,
        business_address: data.businessAddress?.trim() || null,
        city: data.city?.trim() || null,
        province: data.province?.trim() || null,
        phone_office: data.phoneOffice?.trim() || null,
        bio: data.bio?.trim() || null,
        updated_at: new Date().toISOString(),
      };

      const { data: existing } = await db
        .from('employers')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existing) {
        const { error } = await db
          .from('employers')
          .update(employerPayload)
          .eq('user_id', userId);

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 400 });
        }
      } else {
        const { error } = await db.from('employers').insert({
          user_id: userId,
          profile_id: userId,
          ...employerPayload,
        });

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 400 });
        }
      }
    }

    // ── Step 4: Final submit – save everything ──
    if (step === 4 && data) {
      // Save personal info to profiles
      if (data.personal) {
        const { error: profileError } = await db
          .from('profiles')
          .update({
            full_name: data.personal.fullName?.trim() || null,
            phone: data.personal.phone?.trim() || null,
            avatar_url: data.personal.avatarUrl || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        if (profileError) {
          return NextResponse.json(
            { error: profileError.message },
            { status: 400 }
          );
        }
      }

      // Save business details to employers
      if (data.business) {
        const employerPayload = {
          company_name: data.business.companyName?.trim() || null,
          company_type: data.business.companyType?.trim() || null,
          business_address: data.business.businessAddress?.trim() || null,
          city: data.business.city?.trim() || null,
          province: data.business.province?.trim() || null,
          phone_office: data.business.phoneOffice?.trim() || null,
          bio: data.business.bio?.trim() || null,
          updated_at: new Date().toISOString(),
        };

        const { data: existing } = await db
          .from('employers')
          .select('id')
          .eq('user_id', userId)
          .single();

        if (existing) {
          const { error } = await db
            .from('employers')
            .update(employerPayload)
            .eq('user_id', userId);

          if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
          }
        } else {
          const { error } = await db.from('employers').insert({
            user_id: userId,
            profile_id: userId,
            ...employerPayload,
          });

          if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Employer setup API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
