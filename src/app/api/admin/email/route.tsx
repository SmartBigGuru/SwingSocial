import { NextResponse } from 'next/server';
import { ServerClient } from 'postmark';


export async function POST(req: any) {
  try {
    const { targetSegment, templateId, templateName } = await req.json();

    const client = new ServerClient('dcd2cc9f-7ac2-4753-bf70-46cb9df05178');

    // Retrieve email list based on target segment
    const recipients = await getEmailList(targetSegment); // Implement this function

    if (recipients.length === 0) {
      return NextResponse.json({ message: 'No recipients found for the selected segment.' }, { status: 400 });
    }

    // Send emails in bulk
    const emailPromises = recipients.map((recipient) =>
      client.sendEmailWithTemplate({
        From: 'info@swingsocial.co',
        To: recipient.email,
        TemplateId: templateId,
        TemplateModel: {
          name: recipient.name,
          templateName,
        },
      })
    );

    await Promise.all(emailPromises);

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

// Mock function to fetch email list based on the target segment
async function getEmailList(targetSegment: string): Promise<{ email: string; name: string }[]> {
  // Replace this logic with a real database query
  const mockData:any = {
    All: [
      { email: 'faisalayazsolangi@gmail.com', name: 'Faisal' },
      { email: 'smartbigguru@gmail.com', name: 'Antonio' },
    ],
    'Paid Members': [{ email: 'paiduser@example.com', name: 'Paid User' }],
    'Free Members': [{ email: 'freeuser@example.com', name: 'Free User' }],
    'Legacy Members': [{ email: 'legacyuser@example.com', name: 'Legacy User' }],
    'New Platform Members': [{ email: 'newuser@example.com', name: 'New User' }],
  };

  return mockData[targetSegment] || [];
}
