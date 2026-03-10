import { NextResponse } from 'next/server';
import { supabase } from '../../lib/supabase';

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('wines')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Send data straight, we map id to _id for the admin ui retro-compatibility
        const payload = data.map((item: any) => ({
            ...item,
            _id: item.id,
        }));

        return NextResponse.json(payload);
    } catch (error) {
        console.error("GET error", error);
        return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { _id, _originalIndex, id, ...newItem } = body;

        const { error } = await supabase.from('wines').insert([newItem]);
        if (error) throw error;

        return NextResponse.json({ success: true, message: 'Item created' });
    } catch (error) {
        console.error("POST error", error);
        return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { _id, _originalIndex, created_at, ...updatedItem } = body;

        const targetId = _id || body.id;
        if (!targetId) {
            return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
        }

        const { error } = await supabase
            .from('wines')
            .update(updatedItem)
            .eq('id', targetId);

        if (error) throw error;

        return NextResponse.json({ success: true, message: 'Item updated' });
    } catch (error) {
        console.error("PUT error", error);
        return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (id) {
            const { error } = await supabase.from('wines').delete().eq('id', id);
            if (error) throw error;
            return NextResponse.json({ success: true, message: 'Item deleted' });
        }

        // Support the old index logic if needed, although we are shifting to UUIDs.
        return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    } catch (error) {
        console.error("DELETE error", error);
        return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
    }
}
