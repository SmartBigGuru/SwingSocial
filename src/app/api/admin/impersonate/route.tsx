import { NextResponse } from "next/server";
import { Pool } from 'pg';

const pool = new Pool({
    user: 'clark',
    host: '199.244.49.83',
    database: 'swingsocialdb',
    password: 'Bmw635csi#',
    port: 5432,
});

export async function GET(req: Request) {
    try {

        const result = await pool.query(
            'SELECT * FROM public.web_all_profiles()'
        );
        
        return NextResponse.json({
            result
          });
    } catch (error) {
        console.error('Failed to get the history:', error);
        return NextResponse.json({ error: 'Internal Server Error'}, {status: 500});
    }
}