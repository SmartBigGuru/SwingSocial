/**
 * ! We haven't used this file in our template. We've used the server actions in the
 * ! `src/app/server/actions.ts` file to fetch the static data from the fake-db.
 * ! This file has been created to help you understand how you can create your own API routes.
 * ! Only consider making API routes if you're planing to share your project data with other applications.
 * ! else you can use the server actions or third-party APIs to fetch the data from your database.
 */

// Next Imports
import { NextResponse } from 'next/server'
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
    const countResult = await pool.query('SELECT COUNT(*) AS total FROM "azure"."UserProfiles"');
    const totalCount = countResult.rows[0].total;

    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const page = searchParams.get('page') || '';
    const size = searchParams.get('size') || '';

    let query = 'SELECT "DateOfBirth", "Username", "Avatar", "About", "AccountType", "Gender" FROM "azure"."UserProfiles" WHERE TRUE';
    const conditions: string[] = [];
    const values: any[] = [];
    if (search) {
      conditions.push(`"Username" ILIKE $${values.length + 1}`); // Case-insensitive search
      values.push(`%${search}%`); // Use wildcards for partial matches
    }
    if (type) {
      conditions.push(`"AccountType" = $${values.length + 1}`);
      values.push(type);
    }

    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ');
    }

    query += ` OFFSET $${values.length + 1} LIMIT $${values.length + 2}`;
    values.push((Number(size)*Number(page)), Number(size));

    const profilesResult = await pool.query(query, values);
    const responseData = {
      totalCount,          // Total count of records
      profiles: profilesResult.rows // Fetched user profiles
    };
    console.log(responseData)

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Database query failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}