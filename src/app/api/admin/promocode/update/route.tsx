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
    const {id, promoCodeText, description, displayMessage, freeDays, expireDate ,active} = await req.json();

    try {
        // Call the stored procedure with the promoCodeData fields
        const result = await pool.query(
            'SELECT * FROM admin_promocode_update($1,$2,$3,$4,$5,$6,$7)',
            [id,promoCodeText, description, displayMessage, freeDays, expireDate,active]
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
