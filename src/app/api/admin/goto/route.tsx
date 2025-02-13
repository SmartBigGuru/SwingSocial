import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';
import { email } from 'valibot';

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
    const { email } = await req.json();

    console.log("email", email);

    const query = `SELECT * FROM web_one_profile_email($1)`; // Adjusted query to search by profile ID
    try {
        const result = await pool.query(query, [email]);

        console.log("result", result.rows);

        if (result.rows.length == 0) {
            return NextResponse.json({
                message: 'No registered user found with the provided profile ID.',
                status: 404,
                email: null
            });
        } else {
            const profile = result.rows[0];
            const profileId = profile.Id;
            const avatar = profile.Avatar;
            const userName = profile.Username;
            const membership = profile.Title !== "Free Member" ? 1 : 0;

            console.log('membership', membership);

            const token = jwt.sign(
                {
                    profileId: profileId,
                    profileName: userName,
                    avatar: avatar,
                    membership: membership
                },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            return NextResponse.json({
                message: 'Profile fetched successfully!',
                status: 200,
                jwtToken: token,
                currentAvatar: avatar,
                currentProfileId: profileId,
                currentuserName: userName
            });
        }
    } catch (error: any) {
        console.error("Error fetching profile:", error);
        return NextResponse.json({
            message: 'Failure',
        }, { status: 400 });
    }
}