import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export const dynamic = 'force-dynamic';

// PostgreSQL pool connection setup
const pool = new Pool({
    user: 'clark',
    host: '199.244.49.83',
    database: 'swingsocialdb',
    password: 'Bmw635csi#',
    port: 5432,
});

export async function POST(req: any) {
    // Extract data from the request body
    const { promoCodeText, description, displayMessage, freeDays, expireDate } = await req.json();

    try {
        // Call the stored procedure with the promoCodeData fields
        const result = await pool.query(
            'SELECT * FROM admin_promocode_insert($1, $2, $3, $4, $5)',
            [promoCodeText, description, displayMessage, freeDays, expireDate]
        );

        console.log(result);

        return NextResponse.json({
            message: 'Promo code inserted successfully',
        });
    } catch (error: any) {
        console.error(error); // Log error for debugging

        return NextResponse.json(
            {
                message: 'Promo code insertion failed',
            },
            { status: 400 }
        );
    }
}
