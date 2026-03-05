import wineDataRaw from '../../data/wine.json';

export type WineCategory = 'by_the_glass' | 'bottles';
export type WineType = 'sparkling' | 'white' | 'red' | 'sweet';

export interface Wine {
    id: string;
    category: WineCategory;
    type: WineType;
    region: string;
    producer: string;
    name: string;
    vintage: string;
    price_nok: number;
    description?: string;
    country?: string;
    grape?: string;
    location?: string;
}

export function getAllWines(): Wine[] {
    const wines: Wine[] = [];
    let idCounter = 1;

    const menu = wineDataRaw.wine_menu;

    // Process by the glass
    const byTheGlass = menu.by_the_glass;
    for (const [type, typeWines] of Object.entries(byTheGlass)) {
        for (const wine of typeWines) {
            wines.push({
                id: `btg-${idCounter++}`,
                category: 'by_the_glass',
                type: type as WineType,
                region: '',
                producer: '',
                name: wine.name,
                vintage: wine.vintage,
                price_nok: wine.price_nok,
                description: wine.description,
                country: wine.country,
                grape: wine.grape,
                location: wine.location,
            });
        }
    }

    // Process bottles
    const bottles = menu.bottles;
    for (const [type, regionMap] of Object.entries(bottles)) {
        for (const [regionKey, regionWines] of Object.entries(regionMap)) {
            // Clean up region key for display
            const formattedRegion = regionKey
                .split('_')
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' ');

            for (const wine of (regionWines as any[])) {
                wines.push({
                    id: `btl-${idCounter++}`,
                    category: 'bottles',
                    type: type as WineType,
                    region: wine.region || formattedRegion,
                    producer: wine.producer || '',
                    name: wine.name,
                    vintage: wine.vintage,
                    price_nok: wine.price_nok,
                    description: wine.description,
                    country: wine.country,
                    grape: wine.grape,
                    location: wine.location,
                });
            }
        }
    }

    return wines;
}
