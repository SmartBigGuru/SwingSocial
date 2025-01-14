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


export async function GET(req: Request) {
  try {
    // Parse URL parameters
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('id'); // User ID to fetch a single record
    const search = searchParams.get('search') || ''; // Search query
    const type = searchParams.get('type') || 'Email'; // Type filter (Email or Username)
    var page = parseInt(searchParams.get('page') || '1', 10); // Page number
    const size = parseInt(searchParams.get('size') || '10', 10); // Page size

    page = page+1;

    // Validate pagination parameters
    if (page < 1 || size < 1) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters. Page and size must be greater than 0.' },
        { status: 400 }
      );
    }

    const offset = (page - 1) * size;
    let query = `select * From public.admin_emailtemplates_all()`;
    const conditions: string[] = [];
    const values: any[] = [];
    query += ` OFFSET $${values.length + 1} LIMIT $${values.length + 2}`;
    values.push(offset, size);

    const profilesResult = await pool.query(query, values);

    const countQuery = `SELECT COUNT(*) AS total FROM admin_emailtemplates_all()`;
    const countConditions: string[] = [];

    const countQueryFinal =
      countConditions.length > 0
        ? `${countQuery} WHERE ${countConditions.join(' AND ')}`
        : countQuery;

    const countValues = search ? [`%${search}%`] : [];
    const countResult = await pool.query(countQueryFinal, countValues);

    const totalCount = parseInt(countResult.rows[0]?.total, 10) || 0;

    return NextResponse.json({
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / size),
      profiles: profilesResult.rows,
    });
  } catch (error) {
    console.error('Database query failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
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
    if (!alias || !subject || !templateName || !qbody || !qtemplateid) {
      return NextResponse.json(
        { error: 'Missing required fields. Please provide alias, subject, templateName, qbody, qtype, and qtemplateid.' },
        { status: 400 }
      );
    }

    // Execute the insert query
    const query = `SELECT * FROM public.admin_emailtemplate_insert($1,$2,$3,$4,$5,$6,$7,$8,$9)`;
    const values = [
      alias,
      subject,
      templateName,
      qbody,
      qsjsonbody || null,
      1,
      1,
      qtemplateid,
      qassociatedserverid || null,
    ];

    const result = await pool.query(query, values);

    return NextResponse.json(
      { message: 'Template inserted successfully.', data: result.rows },
      { status: 201 }
    );
  } catch (error) {
    console.error('Insert operation failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    // Parse URL parameters
    const body = await req.json();
    const {
     id
    } = body;
    console.log(id);

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required for deletion.' },
        { status: 400 }
      );
    }

    console.log(`Deleting user with ID: ${id}`);

    // Call the admin_delete_profile function to delete the user
    const deleteQuery = `SELECT * FROM public.admin_emailtemplate_delete($1)`;
    const result = await pool.query(deleteQuery, [id]);

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: `No user found with ID ${id}` },
        { status: 404 }
      );
    }

    console.log(`User with ID ${id} deleted successfully.`);
    return NextResponse.json(
      { message: `User with ID ${id} deleted successfully.` },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to delete user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

