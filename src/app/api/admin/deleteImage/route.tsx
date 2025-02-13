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

export async function POST(req: any) {
    try {
        const {data, userId} = await req.json();
        console.log(data, userId);
        const getReportQuery = data === 'avatar' ? `SELECT * FROM admin_deleted_avatar($1)` : `SELECT * FROM admin_deleted_profilebanner($1)`;
        const result = await pool.query(getReportQuery, [userId]);

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
