import crypto from 'crypto';

/**
 * Verify Shopify HMAC signature (OAuth & Webhooks)
 * CRITICAL: This prevents request forgery attacks
 */
export function verifyShopifyHmac(query: Record<string, any>): boolean {
    const { hmac, ...rest } = query;

    if (!hmac) {
        return false;
    }

    // Sort parameters alphabetically (Shopify requirement)
    const sortedParams = Object.keys(rest)
        .sort()
        .map(key => `${key}=${rest[key]}`)
        .join('&');

    // Generate HMAC using secret
    const generatedHmac = crypto
        .createHmac('sha256', process.env.SHOPIFY_API_SECRET!)
        .update(sortedParams)
        .digest('hex');

    // Timing-safe comparison (prevents timing attacks)
    return crypto.timingSafeEqual(
        Buffer.from(generatedHmac),
        Buffer.from(hmac as string)
    );
}

/**
 * Generate Shopify OAuth URL with state parameter
 */
export function generateShopifyAuthUrl(shop: string, state: string): string {
    const apiKey = process.env.NEXT_PUBLIC_SHOPIFY_API_KEY!;
    const scopes = process.env.SHOPIFY_SCOPES!;
    const redirectUri = `${process.env.SHOPIFY_APP_URL}/api/auth/callback`;

    return `https://${shop}/admin/oauth/authorize?client_id=${apiKey}&scope=${scopes}&redirect_uri=${redirectUri}&state=${state}`;
}

/**
 * Exchange OAuth code for access token
 */
export async function getShopifyAccessToken(
    shop: string,
    code: string
): Promise<string> {
    const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            client_id: process.env.NEXT_PUBLIC_SHOPIFY_API_KEY!,
            client_secret: process.env.SHOPIFY_API_SECRET!,
            code,
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to get access token');
    }

    const data = await response.json();
    return data.access_token;
}

/**
 * Install section to Shopify theme
 */
export async function installSectionToShopify(
    shop: string,
    accessToken: string,
    sectionCode: string,
    sectionName: string
): Promise<boolean> {
    try {
        // Get active theme
        const themesResponse = await fetch(
            `https://${shop}/admin/api/2024-01/themes.json`,
            {
                headers: {
                    'X-Shopify-Access-Token': accessToken,
                },
            }
        );

        const { themes } = await themesResponse.json();
        const activeTheme = themes.find((t: any) => t.role === 'main');

        if (!activeTheme) {
            throw new Error('No active theme found');
        }

        // Create section asset
        const assetResponse = await fetch(
            `https://${shop}/admin/api/2024-01/themes/${activeTheme.id}/assets.json`,
            {
                method: 'PUT',
                headers: {
                    'X-Shopify-Access-Token': accessToken,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    asset: {
                        key: `sections/${sectionName}.liquid`,
                        value: sectionCode,
                    },
                }),
            }
        );

        return assetResponse.ok;
    } catch (error) {
        console.error('Section installation failed:', error);
        return false;
    }
}
