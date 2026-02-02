import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    const chargeId = request.nextUrl.searchParams.get('charge_id');

    if (!chargeId) {
        return NextResponse.redirect(`${process.env.SHOPIFY_APP_URL}?error=missing_charge_id`);
    }

    try {
        // Update charge status
        const { data: charge } = await supabaseAdmin
            .from('billing_charges')
            .update({
                status: 'active',
                activated_at: new Date().toISOString()
            })
            .eq('charge_id', chargeId)
            .select('shop_id, charge_type')
            .single();

        if (charge && charge.charge_type === 'subscription') {
            // Update shop subscription status
            await supabaseAdmin
                .from('shops')
                .update({
                    subscription_status: 'active',
                    subscription_charge_id: chargeId,
                    subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                })
                .eq('id', charge.shop_id);
        }

        return NextResponse.redirect(`${process.env.SHOPIFY_APP_URL}?billing=success`);
    } catch (error) {
        console.error('Billing callback error:', error);
        return NextResponse.redirect(`${process.env.SHOPIFY_APP_URL}?error=billing_failed`);
    }
}
