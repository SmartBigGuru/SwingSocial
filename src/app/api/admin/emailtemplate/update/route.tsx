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
export const dynamic = 'force-dynamic';

const pool = new Pool({
  user: 'clark',
  host: '199.244.49.83',
  database: 'swingsocialdb',
  password: 'Bmw635csi#',
  port: 5432,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      id, // Required for updating the template
      alias,
      subject,
      templateName,
      qbody,
      qsjsonbody,
      qactive,
      qtype,
      qtemplateid,
      qassociatedserverid,
    } = body;

    // Validate required fields
    if (!id || !alias || !subject || !templateName || !qbody || !qtemplateid) {
      return NextResponse.json(
        {
          error: 'Missing required fields. Please provide id, alias, subject, templateName, qbody, and qtemplateid.'
        },
        { status: 400 }
      );
    }

    // Execute the update query
    const query = `
      SELECT *
      FROM public.admin_emailtemplate_update($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `;
    const values = [
      id,             // $1
      alias,                       // $2
      subject,                     // $3
      templateName,                // $4
      qbody,                       // $5
      qsjsonbody || null,          // $6
      1,             // $7 (Default to true if not provided)
      1,                  // $8 (Default to 1 if not provided)
      qtemplateid,                 // $9
      qassociatedserverid || null, // $10
    ];

    const result = await pool.query(query, values);

    return NextResponse.json(
      { message: 'Template updated successfully.', data: result.rows },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update operation failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
