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

// Delete an event
// Delete RSVP API (attendee)
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId'); // Event ID
    const profileId = searchParams.get('profileId'); // Profile ID of the attendee

    if (!eventId || !profileId) {
      return NextResponse.json(
        { error: 'Event ID and Profile ID are required for deletion.' },
        { status: 400 }
      );
    }

    console.log(`Removing RSVP for Event ID: ${eventId}, Profile ID: ${profileId}`);

    // Call the database function to delete the attendee from the event
    const deleteQuery = `SELECT * FROM public.event_delete_attendee($1, $2)`; // Modify if needed
    const result = await pool.query(deleteQuery, [profileId, eventId]);

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: `No RSVP found for Event ID ${eventId} and Profile ID ${profileId}` },
        { status: 404 }
      );
    }

    console.log(`RSVP removed for Event ID ${eventId} and Profile ID ${profileId}`);
    return NextResponse.json(
      { message: `RSVP removed for Event ID ${eventId} and Profile ID ${profileId}` },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to remove RSVP:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


