import wineDataRaw from '../../data/LatestData.json';

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

export function getAllWines(): Wine[] {
    const raw = wineDataRaw as any[];

    return raw.map((item, index) => ({
        id: `wine-${index + 1}`,
        type: item.category.toLowerCase() as WineType,
        producer: item.producer || '',
        name: item.wine || '',
        vintage: item.year || '',
        description: item.description || '',
        country: item.country || '',
        location: item.location || '',
    }));
}
