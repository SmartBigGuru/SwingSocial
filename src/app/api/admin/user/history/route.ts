import { NextResponse } from "next/server";
import { Pool } from 'pg';
export const dynamic = 'force-dynamic';

const pool = new Pool({
    user: 'clark',
    host: '199.244.49.83',
    database: 'swingsocialdb',
    password: 'Bmw635csi#',
    port: 5432,
});

export async function GET(req: Request) {
    try {

        const {searchParams} = new URL(req.url)
        const userId = searchParams.get('id')        

        if (!userId) {
            return NextResponse.json(
                { error: 'Profile ID is required to get the history'},
                { status: 400}
            );
        }
        
        console.log(`Getting the history with Profile ID: ${userId}`);

        const getHistoryQuery = `SELECT * FROM admin_get_history($1)`;
        const result = await pool.query(getHistoryQuery, [userId]);
    
        console.log(result)
        if (result.rowCount === 0) {
            return NextResponse.json(
                { error: `No user found with Profile ID ${userId}`},
                { status: 404 }
            )
        }
    
        return NextResponse.json({ history: result.rows });

    } catch (error) {
        console.error('Failed to get the history:', error);
        return NextResponse.json({ error: 'Internal Server Error'}, {status: 500});
    }
}