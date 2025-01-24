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

// Fetch events (all or single)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // Get parameters
    const eventId = searchParams.get('id'); // Event ID to fetch a single record
    const sStatus = (searchParams.get('status') ?? ''); // Event status filter
    const sSearch = (searchParams.get('search') ?? ''); // Search query for event name or description
    const sCompany = (searchParams.get('company') ?? ''); // Company filter
    var sPage = parseInt(searchParams.get('page') || '1', 10); // Page number
    const sSize = (Number(searchParams.get('size') ?? 10)); // Page size

    // Handle fetching a single event if `id` is provided
    if (eventId) {
      console.log('Fetching event with ID:', eventId);

      // Query the database for event details
      const eventQuery = `SELECT * FROM public.event_get_details($1)`;
      const eventValues = [eventId];
      const eventResult = await pool.query(eventQuery, eventValues);

      if (eventResult.rows.length === 0) {
        return NextResponse.json(
          { error: `No event found with ID ${eventId}` },
          { status: 404 }
        );
      }

      const event = eventResult.rows[0];
      console.log('Event fetched:', event);

      // Fetch RSVP, attendees, and tickets data
      const rsvpQuery = `SELECT * FROM event_rsvp_attendees($1, 'rsvp')`;
      const attendeesQuery = `SELECT * FROM event_rsvp_attendees($1, 'attendees')`;
      const ticketsQuery = `SELECT * FROM get_event_ticket_packages($1)`;

      const [rsvpResult, attendeesResult, ticketsResult] = await Promise.all([
        pool.query(rsvpQuery, [eventId]),
        pool.query(attendeesQuery, [eventId]),
        pool.query(ticketsQuery, [eventId]),
      ]);

      const rsvp = rsvpResult.rows;
      const attendees = attendeesResult.rows;
      const tickets = ticketsResult.rows;

      return NextResponse.json({
        event,
        rsvp,
        attendees,
        tickets,
      });
    }

    // Validate pagination params
    sPage = sPage+1;
    if (sPage < 1 || sSize < 1) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters. Page and size must be greater than 0.' },
        { status: 400 }
      );
    }

    const offset = (sPage - 1) * sSize;
    console.log('Fetching events:', { sSearch, sStatus, sCompany, sPage, sSize, offset });

    // Base query for fetching all events
    let query = `SELECT * FROM get_all_events()`;
    const conditions: string[] = [];
    const values: any[] = [];

    // Apply filters based on query parameters
    if (sSearch) {
      conditions.push(`"EventName" ILIKE $${values.length + 1}`);
      values.push(`%${sSearch}%`);
    }
    if (sStatus) {
      conditions.push(`"EventStatus" = $${values.length + 1}`);
      values.push(sStatus);
    }
    if (sCompany) {
      conditions.push(`"Company" ILIKE $${values.length + 1}`);
      values.push(`%${sCompany}%`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` OFFSET $${values.length + 1} LIMIT $${values.length + 2}`;
    values.push(offset, sSize);

    // Execute query to fetch events with filters and pagination
    const eventsResult = await pool.query(query, values);

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) AS total FROM get_all_events()`;
    const countResult = await pool.query(countQuery);
    const totalCount = parseInt(countResult.rows[0]?.total, 10) || 0;

    return NextResponse.json({
      totalCount,
      currentPage: sPage,
      totalPages: Math.ceil(totalCount / sSize),
      events: eventsResult.rows,
    });
  } catch (error) {
    console.error('Database query failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


// Delete an event
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('id'); // Event ID to delete
    console.log(eventId);

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required for deletion.' },
        { status: 400 }
      );
    }

    console.log(`Deleting event with ID: ${eventId}`);

    // Call a hypothetical delete function for events (replace with actual function if available)
    const deleteQuery = `SELECT * FROM public.event_delete($1)`; // Replace with correct function
    const result = await pool.query(deleteQuery, [eventId]);

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: `No event found with ID ${eventId}` },
        { status: 404 }
      );
    }

    console.log(`Event with ID ${eventId} deleted successfully.`);
    return NextResponse.json(
      { message: `Event with ID ${eventId} deleted successfully.` },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to delete event:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {qeventid,qname,start,qend,venue,category} = body;

    if (!qeventid ) {
      return NextResponse.json(
        { error: 'Event ID  required to add update event.' },
        { status: 400 }
      );
    }
    // Call the SQL function to insert RSVP
    const insertQuery = `SELECT * FROM event_edit_($1,$2,$3,$4)`;
    const result = await pool.query(insertQuery, [qeventid, qname,start , qend ]);

    //
     // Call the SQL function to insert RSVP
     const updateVenue = `SELECT * FROM event_edit_venue($1,$2,$3)`;
     const updateVenueResult = await pool.query(updateVenue, [qeventid, venue,category ]);
    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: `Failed update event` },
        { status: 500 }
      );
    }
    if (updateVenueResult.rowCount === 0) {
      return NextResponse.json(
        { error: `Failed to update event vanue and category` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: `Event successfully Updated.` },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to add Event:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
