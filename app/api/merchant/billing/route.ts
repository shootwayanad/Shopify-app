import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const shopDomain = searchParams.get('shop');

    if (!shopDomain) {
        return NextResponse.json({ error: 'Shop domain required' }, { status: 400 });
    }

    try {
        // Get shop subscription info
        const { data: shop } = await supabaseAdmin
            .from('shops')
            .select('id, subscription_status, subscription_plan, subscription_expires_at')
            .eq('shop_domain', shopDomain)
            .single();

        if (!shop) {
            return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
        }

        // Get billing history with section names
        const { data: charges } = await supabaseAdmin
            .from('billing_charges')
            .select(`
                *,
                sections (
                    name
                )
            `)
            .eq('shop_id', shop.id)
            .order('created_at', { ascending: false });

        // Format response
        const formattedCharges = charges?.map((c: any) => ({
            id: c.id,
            charge_type: c.charge_type,
            amount: c.amount,
            status: c.status,
            created_at: c.created_at,
            section_name: c.sections?.name
        })) || [];

        return NextResponse.json({
            subscription: {
                status: shop.subscription_status,
                plan: shop.subscription_plan,
                expires_at: shop.subscription_expires_at
            },
            charges: formattedCharges
        });
    } catch (error) {
        console.error('Error fetching billing data:', error);
        return NextResponse.json({ error: 'Failed to fetch billing data' }, { status: 500 });
    }
}
