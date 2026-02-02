import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
    const { data: plans } = await supabaseAdmin
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

    return NextResponse.json({ plans });
}

export async function POST(request: NextRequest) {
    const plan = await request.json();

    const { data, error } = await supabaseAdmin
        .from('subscription_plans')
        .insert(plan)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ plan: data });
}
