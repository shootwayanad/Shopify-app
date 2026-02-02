import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { generateShopifyAuthUrl } from '@/lib/shopify';

/**
 * OAuth Initiation Route
 * GET /api/auth?shop=SHOP_DOMAIN
 */
export async function GET(request: NextRequest) {
    const shop = request.nextUrl.searchParams.get('shop');

    // Validate shop parameter
    if (!shop || !shop.endsWith('.myshopify.com')) {
        return NextResponse.json(
            { error: 'Invalid shop parameter' },
            { status: 400 }
        );
    }

    // Generate cryptographically secure state
    const state = crypto.randomBytes(32).toString('hex');

    // Generate Shopify OAuth URL
    const authUrl = generateShopifyAuthUrl(shop, state);

    // Create response with redirect
    const response = NextResponse.redirect(authUrl);

    // Store state in secure HTTP-only cookie
    response.cookies.set('shopify_oauth_state', state, {
        httpOnly: true,      // Can't be accessed by JavaScript
        secure: true,        // HTTPS only
        sameSite: 'lax',     // CSRF protection
        maxAge: 600,         // 10 minutes expiry
    });

    return response;
}
