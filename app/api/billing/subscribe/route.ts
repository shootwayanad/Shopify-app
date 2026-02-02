import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createSubscription } from '@/lib/billing';

export async function POST(request: NextRequest) {
    try {
        const { shopDomain, planId } = await request.json();

        // Get shop and plan details
        const { data: shop } = await supabaseAdmin
            .from('shops')
            .select('id, access_token')
            .eq('shop_domain', shopDomain)
            .single();

        const { data: plan } = await supabaseAdmin
            .from('subscription_plans')
            .select('*')
            .eq('id', planId)
            .single();

        if (!shop || !plan) {
            return NextResponse.json({ error: 'Shop or plan not found' }, { status: 404 });
        }

        // Create Shopify subscription
        const result = await createSubscription(shopDomain, shop.access_token, {
            name: plan.name,
            price: plan.price,
            interval: plan.interval === 'monthly' ? 'EVERY_30_DAYS' : 'ANNUAL',
            trialDays: 7
        });

        if (result.userErrors?.length > 0) {
            return NextResponse.json({ error: result.userErrors[0].message }, { status: 400 });
        }

        // Save charge to database
        await supabaseAdmin.from('billing_charges').insert({
            shop_id: shop.id,
            charge_id: result.appSubscription.id,
            charge_type: 'subscription',
            amount: plan.price,
            status: 'pending',
            confirmation_url: result.confirmationUrl
        });

        return NextResponse.json({
            confirmationUrl: result.confirmationUrl
        });
    } catch (error) {
        console.error('Subscription creation error:', error);
        return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
    }
}
