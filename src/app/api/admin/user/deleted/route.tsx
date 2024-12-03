import { NextResponse } from 'next/server'
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

        const getReportQuery = `SELECT * FROM admin_get_deleted_profiles()`
        const result = await pool.query(getReportQuery);

        if (result.rowCount === 0) {
            return NextResponse.json(
                { error: `No deleted profile data!` },
                { status: 404 }
            );
        }

        return NextResponse.json({ deletedProfiles: result.rows, totalCount: result.rows.length });
    } catch (error) {
        console.error('Failed to get the history:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
