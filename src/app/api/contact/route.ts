import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);
const recipientEmail = process.env.CONTACT_FORM_RECIPIENT || "arjillisuvarnaraju@gmail.com";

export async function POST(req: Request) {
  try {
    const { name, email, phone, service, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: "AltarVision Contact <onboarding@resend.dev>", // Replace with your verified domain after setup, e.g., contact@altarvision.in
      to: [recipientEmail],
      subject: `New Contact Form Submission: ${service}`,
      replyTo: email,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; line-height: 1.5; border-radius: 12px; border: 1px solid #e2e8f0;">
          <h2 style="color: #5b4fcf; margin-top: 0;">New Inbound Lead — AltarVision</h2>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #64748b; width: 120px;">Name:</td>
              <td style="padding: 8px 0; font-weight: 500;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Email:</td>
              <td style="padding: 8px 0; font-weight: 500;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Phone:</td>
              <td style="padding: 8px 0; font-weight: 500;">${phone || "Not provided"}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Service:</td>
              <td style="padding: 8px 0; font-weight: 500; text-transform: capitalize;">${service || "General Inquiry"}</td>
            </tr>
          </table>
          
          <div style="margin-top: 25px; padding: 15px; background: #f8fafc; border-radius: 8px; border: 1px solid #f1f5f9;">
            <p style="margin: 0; font-weight: bold; color: #64748b; font-size: 0.8rem; text-transform: uppercase;">Message Content:</p>
            <p style="margin-top: 10px; color: #1e293b;">${message}</p>
          </div>
          
          <footer style="margin-top: 30px; font-size: 0.75rem; color: #94a3b8; text-align: center;">
            Sent automatically by AltarVision Resend API
          </footer>
        </div>
      `,
    });

    if (error) {
      console.error("Resend API error:", error);
      return NextResponse.json({ 
        error: error.message || "Failed to send email through Resend API." 
      }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error("Internal Server Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
