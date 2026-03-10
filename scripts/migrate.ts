import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config'; // to load .env.local

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in environment variables.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
    console.log("Starting migration...");

    const dataPath = path.join(process.cwd(), 'data', 'LatestData.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const wines = JSON.parse(rawData);

    console.log(`Found ${wines.length} wines in JSON. Migrating to Supabase...`);

    // Clean data to match schema
    const formattedWines = wines.map((w: any) => ({
        category: w.category || "",
        producer: w.producer || "",
        wine: w.wine || "",
        year: w.year || "",
        country: w.country || "",
        location: w.location || "",
        description: w.description || "",
    }));

    // We do it in chunks of 50 to avoid any potential timeout/payload size issues
    const chunkSize = 50;
    let successCount = 0;

    for (let i = 0; i < formattedWines.length; i += chunkSize) {
        const chunk = formattedWines.slice(i, i + chunkSize);
        const { data, error } = await supabase.from('wines').insert(chunk);

        if (error) {
            console.error(`Error inserting chunk ${i} to ${i + chunkSize}:`, error);
            console.error(error.message);
            process.exit(1);
        } else {
            successCount += chunk.length;
            console.log(`Successfully inserted ${successCount}/${formattedWines.length} wines...`);
        }
    }

    console.log("Migration complete! All lines successfully moved to Supabase.");
}

migrate().catch(console.error);
