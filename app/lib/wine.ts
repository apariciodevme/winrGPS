import { supabase } from './supabase';

export type WineType = 'sparkling' | 'white' | 'red' | 'sweet' | 'rose';

export interface Wine {
    id: string;
    type: WineType;
    producer: string;
    name: string;
    vintage: string;
    description?: string;
    country?: string;
    location?: string;
}

export async function getAllWines(): Promise<Wine[]> {
    const { data: raw, error } = await supabase
        .from('wines')
        .select('*')
        .order('created_at', { ascending: false });

    if (error || !raw) {
        console.error('Error fetching wines:', error);
        return [];
    }

    return raw.map((item: any) => ({
        id: item.id,
        type: (item.category || 'white').toLowerCase() as WineType,
        producer: item.producer || '',
        name: item.wine || '',
        vintage: item.year || '',
        description: item.description || '',
        country: item.country || '',
        location: item.location || '',
    }));
}
