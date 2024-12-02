
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

// Add a user to RSVP for an event
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { eventId, profileId } = body;

    if (!eventId || !profileId) {
      return NextResponse.json(
        { error: 'Event ID and Profile ID are required to add RSVP.' },
        { status: 400 }
      );
    }

    console.log(`Adding RSVP for Event ID: ${eventId} and Profile ID: ${profileId}`);

    // Call the SQL function to insert RSVP
    const insertQuery = `SELECT * FROM event_insert_rsvp($1, $2)`;
    const result = await pool.query(insertQuery, [eventId, profileId]);

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: `Failed to add RSVP for Event ID ${eventId} and Profile ID ${profileId}` },
        { status: 500 }
      );
    }

    console.log(`RSVP added for Event ID ${eventId} and Profile ID ${profileId}.`);
    return NextResponse.json(
      { message: `RSVP successfully added for Event ID ${eventId} and Profile ID ${profileId}.` },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to add RSVP:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Delete an RSVP from Event
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('id'); // Event ID
    const profileId = searchParams.get('profileId'); // Profile ID

    if (!eventId || !profileId) {
      return NextResponse.json(
        { error: 'Event ID and Profile ID are required for deletion.' },
        { status: 400 }
      );
    }

    console.log(`Deleting RSVP with Event ID: ${eventId} and Profile ID: ${profileId}`);

    // Call the SQL function to delete RSVP
    const deleteQuery = `SELECT * FROM event_delete_rsvp($1, $2)`;
    const result = await pool.query(deleteQuery, [eventId, profileId]);

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: `No RSVP found for Event ID ${eventId} and Profile ID ${profileId}` },
        { status: 404 }
      );
    }

    console.log(`RSVP with Event ID ${eventId} and Profile ID ${profileId} deleted successfully.`);
    return NextResponse.json(
      { message: `RSVP with Event ID ${eventId} and Profile ID ${profileId} deleted successfully.` },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to delete RSVP:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
