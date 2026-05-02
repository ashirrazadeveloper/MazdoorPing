import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { step, data } = body;

    // ── Step 1: Personal Information → update profiles table ──
    if (step === 1 && data) {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.fullName?.trim() || null,
          phone: data.phone?.trim() || null,
          avatar_url: data.avatarUrl || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

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

      const { data: existing } = await supabase
        .from('employers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('employers')
          .update(employerPayload)
          .eq('user_id', user.id);

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 400 });
        }
      } else {
        const { error } = await supabase.from('employers').insert({
          user_id: user.id,
          profile_id: user.id,
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
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: data.personal.fullName?.trim() || null,
            phone: data.personal.phone?.trim() || null,
            avatar_url: data.personal.avatarUrl || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

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

        const { data: existing } = await supabase
          .from('employers')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (existing) {
          const { error } = await supabase
            .from('employers')
            .update(employerPayload)
            .eq('user_id', user.id);

          if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
          }
        } else {
          const { error } = await supabase.from('employers').insert({
            user_id: user.id,
            profile_id: user.id,
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
