import postmark from 'postmark';
import { ServerClient } from 'postmark'; // Use named import for ServerClient

import { NextResponse } from 'next/server';

export async function POST(req: any) {
    try {

        const { subject,htmlBody, email} = await req.json();
        const client = new ServerClient('dcd2cc9f-7ac2-4753-bf70-46cb9df05178')

        const emailData:any = {
            From: 'info@swingsocial.co',
            To: email,
            Subject:subject,
            TextBody:"",
            HtmlBody:htmlBody,
            Messagestream:"outbound"
        };

        await client.sendEmail(emailData)
        return NextResponse.json({
            message: 'Email is sent successfully',
        });

    } catch (error: any) {

        console.error('Error sending email:', error);

        return NextResponse.json(
            {
                message: 'Error sending email',
                error: error.message,
            },
            { status: 500 }
        );
    }
}
