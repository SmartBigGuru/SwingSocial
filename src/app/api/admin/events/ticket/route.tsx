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
      const { ticketName, ticketType, price, quantity, eventId } = await req.json();

      // Validate the required fields
      if (!ticketName || !ticketType || !price || !quantity || !eventId) {
        return NextResponse.json(
          { error: 'Missing required fields: ticketName, ticketType, price, quantity, eventId' },
          { status: 400 }
        );
      }

      // Insert ticket data into the database using the ticket_insert function
      const insertQuery = `SELECT * FROM public.ticket_insert($1,$2,$3,$4,$5)`;
      const insertValues = [ticketName, ticketType, price, quantity, eventId];

      const result = await pool.query(insertQuery, insertValues);

      // Check for successful insert
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Failed to create ticket' },
          { status: 500 }
        );
      }

      const newTicket = result.rows[0];
      console.log('Ticket created:', newTicket);

      return NextResponse.json(
        { message: 'Ticket created successfully', ticket: newTicket },
        { status: 201 }
      );
    } catch (error) {
      console.error('Database query failed:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
