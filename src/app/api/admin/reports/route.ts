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

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1', 10); // Page number
        const size = parseInt(searchParams.get('size') || '10', 10); // Page size
        
        let getReportQuery = `SELECT * FROM report_paid_subscribers_by_month()`
        const conditions: string[] = [];
        const values: any[] = [];
        const result = await pool.query(getReportQuery);

        if (page < 1 || size < 1) {
            return NextResponse.json(
              { error: 'Invalid pagination parameters. Page and size must be greater than 0.' },
              { status: 400 }
            );
          }

          const offset = (page - 1) * size;
          console.log('Fetching all users:', { page, size, offset });

            getReportQuery += ` OFFSET $${values.length + 1} LIMIT $${values.length + 2}`;
            values.push(offset, size);

            const reportResult = await pool.query(getReportQuery, values);

        if (result.rowCount === 0) {
            return NextResponse.json(
              { error: `No report data!` },
              { status: 404 }
            );
          }

          const totalCount = reportResult.rows.length;
        
        return NextResponse.json({
            totalCount,
            currentPage: page,
            totalPages: Math.ceil(totalCount / size),
            reports: reportResult.rows,
          });
    } catch (error) {
        console.error('Failed to get the history:', error);
        return NextResponse.json({ error: 'Internal Server Error'}, {status: 500});
    }
}