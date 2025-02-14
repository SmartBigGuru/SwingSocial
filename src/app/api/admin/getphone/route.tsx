import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';
import { email } from 'valibot';
import { Phone } from '@mui/icons-material';

const VERSION = 1; // Example version, same as `PasswordHasher.GetVersion`
export const dynamic = 'force-dynamic';

const JWT_SECRET = "SwingSocialLesile";

// PostgreSQL pool connection setup
const pool = new Pool({
    user: 'clark',
    host: '199.244.49.83',
    database: 'swingsocialdb',
    password: 'Bmw635csi#',
    port: 5432,
});

export async function POST(req: any) {
    
    const queryoriginal = `SELECT * FROM admin_get_userid($1)`; // Adjusted query to search by profile ID
    const query = `SELECT * FROM admin_get_phone($1)`; // Adjusted query to search by profile ID
    try {
        const { id } = await req.json();
        const resultoriginal = await pool.query(queryoriginal, [id]);

        console.log("UserId", resultoriginal.rows[0].UserId);
        const result = await pool.query(query, [resultoriginal.rows[0].UserId]);

        console.log("resultData", result.rows[0].Phone);

        if (result.rows.length == 0) {
            return NextResponse.json({
                message: 'No registered user found with the provided profile ID.',
                status: 404,
                email: null
            });
        } else {

            return NextResponse.json({
                message: 'Profile fetched successfully!',
                status: 200,
                phone: result.rows[0].Phone
            });
        }
    } catch (error: any) {
        console.error("Error fetching profile:", error);
        return NextResponse.json({
            message: 'Failure',
        }, { status: 400 });
    }
}