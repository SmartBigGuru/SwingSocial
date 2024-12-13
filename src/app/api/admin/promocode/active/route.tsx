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
    console.log("aaaaaa");
    // Extract data from the request body
    const { id } = await req.json();
    console.log(id)
    try {
        // Call the stored procedure with the promoCodeData fields
        const result = await pool.query(
            'SELECT * FROM admin_promocode_activate($1)',
            [id]
        );

        console.log(result);

        return NextResponse.json({
            message: 'Promo code is activated successfully',
        });
    } catch (error: any) {
        console.error(error); // Log error for debugging

        return NextResponse.json(
            {
                message: 'Promo code activation is failed',
            },
            { status: 400 }
        );
    }
}
