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

        console.log("Aaaa");
        const getReportQuery = `SELECT * FROM report_paid_subscribers_by_month()`
        const result = await pool.query(getReportQuery);

        if (result.rowCount === 0) {
            return NextResponse.json(
              { error: `No report data!` },
              { status: 404 }
            );
          }

        return NextResponse.json({ reports: result.rows });
    } catch (error) {
        console.error('Failed to get the history:', error);
        return NextResponse.json({ error: 'Internal Server Error'}, {status: 500});
    }
}