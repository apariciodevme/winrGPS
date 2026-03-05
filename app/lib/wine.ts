import wineDataRaw from '../../data/wineUpdated.json';

export type WineCategory = 'by_the_glass' | 'bottles';
export type WineType = 'sparkling' | 'white' | 'red' | 'sweet' | 'rose' | 'dessert_wine' | 'beer_and_cider_draft' | 'beer_and_cider_bottle' | 'non_alcoholic_beverages' | 'non_alcoholic_soda_and_water';

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

    // Use type assertion since wineUpdated.json is loosely typed
    const menu = (wineDataRaw as any).wine_menu;

    // Helper to extract common wine properties safely
    const createWineParams = (wine: any): Partial<Wine> => ({
        producer: wine.producer || '',
        name: wine.name || '',
        vintage: wine.vintage || wine.volume || '', // Some use 'volume' instead of 'vintage'
        price_nok: wine.price_nok || wine.bottle_price_nok || 0,
        description: wine.description || '',
        country: wine.country || '',
        grape: wine.grape || wine.category || '', // Some use 'category' for Grape/Style
        location: wine.location || ''
    });

    // 1. By the Glass
    if (menu.by_the_glass) {
        for (const [type, typeWines] of Object.entries(menu.by_the_glass)) {
            for (const wine of (typeWines as any[])) {
                wines.push({
                    id: `btg-${idCounter++}`,
                    category: 'by_the_glass',
                    type: type as WineType,
                    region: '',
                    ...createWineParams(wine)
                } as Wine);
            }
        }
    }

    // 2. Beer & Cider
    if (menu.beer_and_cider) {
        if (menu.beer_and_cider.draft) {
            for (const wine of menu.beer_and_cider.draft) {
                wines.push({
                    id: `btg-${idCounter++}`,
                    category: 'by_the_glass',
                    type: 'beer_and_cider_draft',
                    region: '',
                    ...createWineParams(wine)
                } as Wine);
            }
        }
        if (menu.beer_and_cider.bottle) {
            for (const wine of menu.beer_and_cider.bottle) {
                wines.push({
                    id: `btl-${idCounter++}`,
                    category: 'bottles',
                    type: 'beer_and_cider_bottle',
                    region: '',
                    ...createWineParams(wine)
                } as Wine);
            }
        }
    }

    // 3. Non-Alcoholic
    if (menu.non_alcoholic) {
        if (menu.non_alcoholic.beverages) {
            for (const wine of menu.non_alcoholic.beverages) {
                wines.push({
                    id: `btg-${idCounter++}`,
                    category: 'by_the_glass',
                    type: 'non_alcoholic_beverages',
                    region: '',
                    ...createWineParams(wine)
                } as Wine);
            }
        }
        if (menu.non_alcoholic.soda_and_water) {
            for (const wine of menu.non_alcoholic.soda_and_water) {
                wines.push({
                    id: `btg-${idCounter++}`,
                    category: 'by_the_glass',
                    type: 'non_alcoholic_soda_and_water',
                    region: '',
                    ...createWineParams(wine)
                } as Wine);
            }
        }
    }

    // Helper to recursively flatten bottles
    const flattenBottles = (obj: any, type: WineType, parentKey = '') => {
        for (const key in obj) {
            if (Array.isArray(obj[key])) {
                const regionName = key
                    .split('_')
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(' ');

                const formattedRegion = parentKey ?
                    `${parentKey.charAt(0).toUpperCase() + parentKey.slice(1)} ${regionName}`
                    : regionName;

                for (const wine of obj[key]) {
                    wines.push({
                        id: `btl-${idCounter++}`,
                        category: 'bottles',
                        type: type,
                        region: wine.region || formattedRegion,
                        ...createWineParams(wine)
                    } as Wine);
                }
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                flattenBottles(obj[key], type, key);
            }
        }
    };

    // 4. Bottles (Sparkling, White, Red, Rose, Dessert)
    if (menu.bottles_sparkling) flattenBottles(menu.bottles_sparkling, 'sparkling');
    if (menu.bottles_white) flattenBottles(menu.bottles_white, 'white');
    if (menu.bottles_red) flattenBottles(menu.bottles_red, 'red');

    if (menu.bottles_rose && Array.isArray(menu.bottles_rose)) {
        for (const wine of menu.bottles_rose) {
            wines.push({
                id: `btl-${idCounter++}`,
                category: 'bottles',
                type: 'rose',
                region: '',
                ...createWineParams(wine)
            } as Wine);
        }
    }

    if (menu.dessert_wine && Array.isArray(menu.dessert_wine)) {
        for (const wine of menu.dessert_wine) {
            wines.push({
                id: `btl-${idCounter++}`,
                category: 'bottles',
                type: 'dessert_wine',
                region: wine.region || '',
                ...createWineParams(wine)
            } as Wine);
        }
    }

    return wines;
}
