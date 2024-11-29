/**
 * ! We haven't used this file in our template. We've used the server actions in the
 * ! `src/app/server/actions.ts` file to fetch the static data from the fake-db.
 * ! This file has been created to help you understand how you can create your own API routes.
 * ! Only consider making API routes if you're planing to share your project data with other applications.
 * ! else you can use the server actions or third-party APIs to fetch the data from your database.
 */

// Next Imports
import { responsiveFontSizes } from '@mui/material';
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
    // Parse URL parameters
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || ''; // Search query
    const type = searchParams.get('type') || ''; // Type filter
    var page = parseInt(searchParams.get('page') || '1', 10); // Page number

    if(page == 0){
      page = 1
      console.log("true");
    }
    const size = parseInt(searchParams.get('size') || '10', 10); // Page size
    // Validate page and size
    if (page < 1 || size < 1) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters. Page and size must be greater than 0.' },
        { status: 400 }
      );
    }
    const offset = (page - 1) * size;

    console.log('Parsed parameters:', { search, type, page, size, offset });

    // Start building query dynamically
    let query = `SELECT * FROM public.admin_getalldata()`;
    const conditions: string[] = [];
    const values: any[] = [];

    if (search) {
      conditions.push(`"Username" ILIKE $${values.length + 1}`);
      values.push(`%${search}%`);
    }
    if (type) {
      conditions.push(`"AccountType" = $${values.length + 1}`);
      values.push(type);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }
     
    // Add pagination
    query += ` OFFSET $${values.length + 1} LIMIT $${values.length + 2}`;
    values.push(offset, size);

    console.log('Generated query:', query);
    console.log('Query values:', values);

    // Execute query for profiles
    const profilesResult = await pool.query(query, values);

    // Query total count for pagination metadata
    const countQuery = `SELECT COUNT(*) AS total FROM public.admin_getalldata()`;
    const countResult = await pool.query(countQuery);
    const totalCount = parseInt(countResult.rows[0]?.total, 10) || 0;

    console.log('Profiles fetched:', profilesResult.rows);
    console.log('Total count:', totalCount);

    // Construct response
    const responseData = {
      totalCount,          // Total count of records
      currentPage: page,   // Current page number
      totalPages: Math.ceil(totalCount / size), // Total number of pages
      profiles: profilesResult.rows // Fetched user profiles
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Database query failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
