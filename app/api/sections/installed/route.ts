import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const shopDomain = searchParams.get('shop');

    if (!shopDomain) {
        return NextResponse.json({ error: 'Shop required' }, { status: 400 });
    }

    try {
        const { data: shop } = await supabaseAdmin.from('shops').select('id').eq('shop_domain', shopDomain).single();
        if (!shop) return NextResponse.json({ sections: [] });

        const { data: installedSections } = await supabaseAdmin
            .from('section_installations')
            .select(`
                section_id,
                installed_at,
                sections (
                    *,
                    categories (name, slug)
                )
            `)
            .eq('shop_id', shop.id);

        const sections = installedSections?.map((i: any) => i.sections).filter(Boolean) || [];

        return NextResponse.json({ sections });
    } catch (error) {
        console.error('Error fetching installed sections:', error);
        return NextResponse.json({ error: 'Failed to fetch sections' }, { status: 500 });
    }
}
