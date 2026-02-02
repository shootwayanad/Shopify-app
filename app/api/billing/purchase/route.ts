import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createOneTimeCharge } from '@/lib/billing';

export async function POST(request: NextRequest) {
    try {
        const { shopDomain, sectionId } = await request.json();

        const { data: shop } = await supabaseAdmin
            .from('shops')
            .select('id, access_token')
            .eq('shop_domain', shopDomain)
            .single();

        const { data: section } = await supabaseAdmin
            .from('sections')
            .select('name, price')
            .eq('id', sectionId)
            .single();

        if (!shop || !section) {
            return NextResponse.json({ error: 'Shop or section not found' }, { status: 404 });
        }

        const result = await createOneTimeCharge(shopDomain, shop.access_token, {
            name: `Section: ${section.name}`,
            price: section.price,
            returnUrl: `${process.env.SHOPIFY_APP_URL}/api/billing/callback`
        });

        if (result.userErrors?.length > 0) {
            return NextResponse.json({ error: result.userErrors[0].message }, { status: 400 });
        }

        await supabaseAdmin.from('billing_charges').insert({
            shop_id: shop.id,
            charge_id: result.appPurchaseOneTime.id,
            charge_type: 'one_time',
            amount: section.price,
            status: 'pending',
            section_id: sectionId,
            confirmation_url: result.confirmationUrl
        });

        return NextResponse.json({
            confirmationUrl: result.confirmationUrl
        });
    } catch (error) {
        console.error('Purchase error:', error);
        return NextResponse.json({ error: 'Failed to create purchase' }, { status: 500 });
    }
}
