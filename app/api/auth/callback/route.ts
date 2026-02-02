import { NextRequest, NextResponse } from 'next/server';
import { verifyShopifyHmac, getShopifyAccessToken } from '@/lib/shopify';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * OAuth Callback Route
 * GET /api/auth/callback?code=CODE&hmac=HMAC&shop=SHOP&state=STATE
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const receivedState = searchParams.get('state');
    const storedState = request.cookies.get('shopify_oauth_state')?.value;

    // CRITICAL: Validate state parameter (prevents CSRF attacks)
    if (!receivedState || receivedState !== storedState) {
        return NextResponse.json(
            { error: 'Invalid state parameter - possible CSRF attack' },
            { status: 403 }
        );
    }

    // Convert searchParams to object for HMAC verification
    const params = Object.fromEntries(searchParams);

    // CRITICAL: Verify HMAC signature (prevents request forgery)
    if (!verifyShopifyHmac(params)) {
        return NextResponse.json(
            { error: 'Invalid HMAC signature' },
            { status: 403 }
        );
    }

    const code = searchParams.get('code');
    const shop = searchParams.get('shop');

    if (!code || !shop) {
        return NextResponse.json(
            { error: 'Missing required parameters' },
            { status: 400 }
        );
    }

    try {
        // Exchange code for access token
        const accessToken = await getShopifyAccessToken(shop, code);

        // Store shop data in Supabase
        const { error: dbError } = await supabaseAdmin
            .from('shops')
            .upsert({
                shop_domain: shop,
                access_token: accessToken,
                scope: process.env.SHOPIFY_SCOPES,
                is_active: true,
                updated_at: new Date().toISOString(),
            }, {
                onConflict: 'shop_domain'
            });

        if (dbError) {
            console.error('Database error:', dbError);
            return NextResponse.json(
                { error: 'Failed to store shop data' },
                { status: 500 }
            );
        }

        // Clear state cookie (one-time use)
        const response = NextResponse.redirect(`${process.env.SHOPIFY_APP_URL}/?shop=${shop}`);
        response.cookies.delete('shopify_oauth_state');

        return response;
    } catch (error) {
        console.error('OAuth error:', error);
        return NextResponse.json(
            { error: 'OAuth flow failed' },
            { status: 500 }
        );
    }
}
