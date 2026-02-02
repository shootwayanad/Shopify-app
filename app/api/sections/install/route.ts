import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { installSectionToShopify } from '@/lib/shopify';

/**
 * Install Section API
 * POST /api/sections/install
 * Body: { shopDomain, sectionId }
 */
export async function POST(request: NextRequest) {
    try {
        const { shopDomain, sectionId } = await request.json();

        if (!shopDomain || !sectionId) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            );
        }

        // Get shop access token
        const { data: shop, error: shopError } = await supabaseAdmin
            .from('shops')
            .select('access_token, id')
            .eq('shop_domain', shopDomain)
            .single();

        if (shopError || !shop) {
            return NextResponse.json(
                { error: 'Shop not found' },
                { status: 404 }
            );
        }

        // Get section data
        const { data: section, error: sectionError } = await supabaseAdmin
            .from('sections')
            .select('liquid_code, name, is_free, price, id, downloads_count')
            .eq('id', sectionId)
            .single();

        if (sectionError || !section) {
            return NextResponse.json(
                { error: 'Section not found' },
                { status: 404 }
            );
        }

        // TODO: Check if section is paid and user has purchased
        if (!section.is_free && section.price > 0) {
            const { data: purchase } = await supabaseAdmin
                .from('purchases')
                .select('id')
                .eq('shop_id', shop.id)
                .eq('section_id', sectionId)
                .eq('payment_status', 'completed')
                .single();

            if (!purchase) {
                return NextResponse.json(
                    { error: 'Section not purchased' },
                    { status: 403 }
                );
            }
        }

        // Install section to Shopify
        const installed = await installSectionToShopify(
            shopDomain,
            shop.access_token,
            section.liquid_code,
            section.name.toLowerCase().replace(/\s+/g, '-')
        );

        if (!installed) {
            return NextResponse.json(
                { error: 'Failed to install section' },
                { status: 500 }
            );
        }

        // Record installation
        await supabaseAdmin
            .from('section_installations')
            .upsert({
                shop_id: shop.id,
                section_id: sectionId,
            }, {
                onConflict: 'shop_id,section_id'
            });

        // Increment download count
        await supabaseAdmin
            .from('sections')
            .update({ downloads_count: section.downloads_count + 1 })
            .eq('id', sectionId);

        return NextResponse.json({
            success: true,
            message: 'Section installed successfully',
        });
    } catch (error) {
        console.error('Installation error:', error);
        return NextResponse.json(
            { error: 'Installation failed' },
            { status: 500 }
        );
    }
}
