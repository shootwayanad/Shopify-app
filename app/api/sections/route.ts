import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * List Sections API
 * GET /api/sections?category=SLUG&search=QUERY
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    try {
        let query = supabase
            .from('sections')
            .select(`
        *,
        categories (
          name,
          slug
        )
      `)
            .eq('is_active', true)
            .order('downloads_count', { ascending: false });

        // Filter by category
        if (category) {
            const { data: categoryData } = await supabase
                .from('categories')
                .select('id')
                .eq('slug', category)
                .single();

            if (categoryData) {
                query = query.eq('category_id', categoryData.id);
            }
        }

        // Search by name or description
        if (search) {
            query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
        }

        const { data: sections, error } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ sections });
    } catch (error) {
        console.error('Error fetching sections:', error);
        return NextResponse.json(
            { error: 'Failed to fetch sections' },
            { status: 500 }
        );
    }
}
