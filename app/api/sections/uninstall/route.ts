import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Uninstall Section API
 * DELETE /api/sections/uninstall?shop=DOMAIN&id=SECTION_ID
 */
export async function DELETE(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const shopDomain = searchParams.get('shop');
    const sectionId = searchParams.get('id');

    if (!shopDomain || !sectionId) {
        return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    try {
        // Get shop ID
        const { data: shop } = await supabaseAdmin
            .from('shops')
            .select('id, access_token')
            .eq('shop_domain', shopDomain)
            .single();

        if (!shop) {
            return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
        }

        // Get section name for asset deletion
        const { data: section } = await supabaseAdmin
            .from('sections')
            .select('name')
            .eq('id', sectionId)
            .single();

        if (!section) {
            return NextResponse.json({ error: 'Section not found' }, { status: 404 });
        }

        const sectionName = section.name.toLowerCase().replace(/\s+/g, '-');

        // Delete from Shopify theme
        const themesResponse = await fetch(
            `https://${shopDomain}/admin/api/2024-01/themes.json`,
            {
                headers: {
                    'X-Shopify-Access-Token': shop.access_token,
                },
            }
        );
        const { themes } = await themesResponse.json();
        const activeTheme = themes.find((t: any) => t.role === 'main');

        if (activeTheme) {
            await fetch(
                `https://${shopDomain}/admin/api/2024-01/themes/${activeTheme.id}/assets.json?asset[key]=sections/${sectionName}.liquid`,
                {
                    method: 'DELETE',
                    headers: {
                        'X-Shopify-Access-Token': shop.access_token,
                    },
                }
            );
        }

        // Remove from our DB
        await supabaseAdmin
            .from('section_installations')
            .delete()
            .eq('shop_id', shop.id)
            .eq('section_id', sectionId);

        return NextResponse.json({ success: true, message: 'Section uninstalled' });
    } catch (error) {
        console.error('Uninstall error:', error);
        return NextResponse.json({ error: 'Failed to uninstall section' }, { status: 500 });
    }
}
