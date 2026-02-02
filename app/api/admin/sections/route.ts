import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Admin Sections API
 * CRUD operations for section management
 */

// List all sections (admin view)
export async function GET(request: NextRequest) {
    try {
        const { data: sections, error } = await supabaseAdmin
            .from('sections')
            .select(`
        *,
        categories (
          name,
          slug
        )
      `)
            .order('created_at', { ascending: false });

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

// Create new section
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            name,
            description,
            category_id,
            liquid_code,
            schema_json,
            css_code,
            js_code,
            preview_image_url,
            is_free,
            price,
        } = body;

        // Validation
        if (!name || !liquid_code || !schema_json) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const { data: section, error } = await supabaseAdmin
            .from('sections')
            .insert({
                name,
                description,
                category_id,
                liquid_code,
                schema_json,
                css_code,
                js_code,
                preview_image_url,
                is_free: is_free ?? true,
                price: price ?? 0,
                is_active: true,
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ section }, { status: 201 });
    } catch (error) {
        console.error('Error creating section:', error);
        return NextResponse.json(
            { error: 'Failed to create section' },
            { status: 500 }
        );
    }
}

// Update section
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json(
                { error: 'Section ID required' },
                { status: 400 }
            );
        }

        const { data: section, error } = await supabaseAdmin
            .from('sections')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ section });
    } catch (error) {
        console.error('Error updating section:', error);
        return NextResponse.json(
            { error: 'Failed to update section' },
            { status: 500 }
        );
    }
}

// Delete section
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Section ID required' },
                { status: 400 }
            );
        }

        const { error } = await supabaseAdmin
            .from('sections')
            .delete()
            .eq('id', id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting section:', error);
        return NextResponse.json(
            { error: 'Failed to delete section' },
            { status: 500 }
        );
    }
}
