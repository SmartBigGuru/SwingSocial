
/**
 * ! We haven't used this file in our template. We've used the server actions in the
 * ! `src/app/server/actions.ts` file to fetch the static data from the fake-db.
 * ! This file has been created to help you understand how you can create your own API routes.
 * ! Only consider making API routes if you're planing to share your project data with other applications.
 * ! else you can use the server actions or third-party APIs to fetch the data from your database.
 */

// Next Imports
import { NextResponse } from 'next/server'
import { ServerClient } from 'postmark';
import { Pool } from 'pg';
export const dynamic = 'force-dynamic';


const pool = new Pool({
  user: 'clark',
  host: '199.244.49.83',
  database: 'swingsocialdb',
  password: 'Bmw635csi#',
  port: 5432,
});



function chunkArray(array: any, size: any) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}
export async function POST(req: any) {
  try {
    const { recipients, htmlBody, subject } = await req.json();

    const client = new ServerClient('dcd2cc9f-7ac2-4753-bf70-46cb9df05178');

    if (recipients.length === 0) {
      return NextResponse.json({ message: 'No recipients found for the selected segment.' }, { status: 400 });
    }
    // Split the recipients into chunks of 40
    const recipientChunks = chunkArray(recipients, 40);

    console.log(recipients.length);
    console.log(recipientChunks.length);

    for (const chunk of recipientChunks) {
      // Prepare email objects for the current chunk
      const emailBatch = chunk.map((recipient: any) => ({
        From: 'info@swingsocial.co',
        To: recipient.email, // Assuming each recipient has an `email` property
        Subject: subject,
        TextBody: "",
        HtmlBody: htmlBody,
        MessageStream: "outbound",
      }));

      // Send the email batch
      try {
        await client.sendEmailBatch(emailBatch);

        //console.log(`Batch of ${emailBatch.length} emails sent successfully.`);
      } catch (error) {
        console.error("Error sending email batch:", error);
      }
    }
    return NextResponse.json({ message: 'Emails sent successfully!' });
  } catch (error: any) {
    console.error('Error sending bulk emails:', error);
    return NextResponse.json(
      {
        message: 'Error sending bulk emails',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
