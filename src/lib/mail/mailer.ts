import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;
const fromEmail = "AltarVision Marketplace <onboarding@resend.dev>";

export async function sendWelcomeEmail(to: string, userName: string): Promise<boolean> {
  if (!resend) {
    console.error("Resend API key missing. Welcome email skipped.");
    return false;
  }

  try {
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: "Welcome to AltarVision AI Prompt Marketplace!",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 25px; color: #0c0a2e; line-height: 1.6; border-radius: 18px; border: 1px solid rgba(91,79,207,0.15); max-width: 600px; margin: 0 auto; background: #f0f4ff;">
          <h2 style="color: #5b4fcf; margin-top: 0; font-size: 24px; font-weight: 800;">Welcome to AltarVision, ${userName}!</h2>
          <hr style="border: 0; border-top: 1.5px solid rgba(91,79,207,0.1); margin: 20px 0;">
          <p>We are thrilled to welcome you to our premium AI Prompt Marketplace. Here, you'll discover elite, production-ready prompts designed to supercharge your AI workflows.</p>
          <p>With your account, you can now:</p>
          <ul style="padding-left: 20px;">
            <li style="margin-bottom: 8px;"><strong>Browse and Search</strong> hundreds of premium prompts.</li>
            <li style="margin-bottom: 8px;"><strong>Purchase Individual Prompts or Bundles</strong> securely via Razorpay.</li>
            <li style="margin-bottom: 8px;"><strong>Access & Manage</strong> your purchased prompts and download TXT files from your dashboard.</li>
            <li style="margin-bottom: 8px;"><strong>Save Favorites</strong> to your wishlist for later.</li>
          </ul>
          <div style="margin-top: 30px; text-align: center;">
            <a href="https://altarvision.in/prompts" style="background: linear-gradient(130deg, #5b4fcf 0%, #3b82f6 100%); color: white; padding: 12px 28px; border-radius: 10px; font-weight: bold; text-decoration: none; display: inline-block; box-shadow: 0 4px 12px rgba(91,79,207,0.25);">Explore Prompts</a>
          </div>
          <p style="margin-top: 30px; font-size: 0.9rem; color: #5e5a8a;">Need help getting started? Visit your dashboard support area to file a ticket with our team.</p>
          <footer style="margin-top: 40px; font-size: 0.75rem; color: #a09ec0; text-align: center; border-t: 1px solid rgba(91,79,207,0.1); pt-20px;">
            © ${new Date().getFullYear()} AltarVision Digital Agency. All rights reserved.
          </footer>
        </div>
      `,
    });

    if (error) {
      console.error("Failed to send welcome email:", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Welcome email failed:", error);
    return false;
  }
}

export async function sendPurchaseConfirmationEmail(
  to: string,
  userName: string,
  orderId: string,
  amount: number,
  items: { title: string; price: number }[]
): Promise<boolean> {
  if (!resend) {
    console.error("Resend API key missing. Purchase email skipped.");
    return false;
  }

  try {
    const itemsListHtml = items
      .map(
        (item) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid rgba(91,79,207,0.1); font-weight: bold; color: #2d2b5e;">${item.title}</td>
        <td style="padding: 12px 0; border-bottom: 1px solid rgba(91,79,207,0.1); text-align: right; font-weight: bold; color: #0c0a2e;">₹${item.price}</td>
      </tr>
    `
      )
      .join("");

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: `Order Confirmed! Receipt for Order #${orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 25px; color: #0c0a2e; line-height: 1.6; border-radius: 18px; border: 1px solid rgba(91,79,207,0.15); max-width: 600px; margin: 0 auto; background: #ffffff;">
          <h2 style="color: #10b981; margin-top: 0; font-size: 24px; font-weight: 800;">Payment Successful!</h2>
          <p>Hi ${userName},</p>
          <p>Thank you for your purchase! Your payment has been verified, and your premium prompt access is now unlocked in your dashboard.</p>
          
          <div style="background: #f0f4ff; padding: 18px; border-radius: 12px; margin: 20px 0; border: 1px solid rgba(91,79,207,0.1);">
            <p style="margin: 0 0 8px 0; font-size: 0.85rem; color: #5e5a8a; font-weight: bold; text-transform: uppercase;">Order Details</p>
            <p style="margin: 0 0 4px 0; font-size: 0.9rem;"><strong>Order ID:</strong> ${orderId}</p>
            <p style="margin: 0; font-size: 0.9rem;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
              <tr>
                <th style="text-align: left; padding-bottom: 8px; border-bottom: 2px solid rgba(91,79,207,0.15); color: #5e5a8a; font-size: 0.8rem; text-transform: uppercase;">Purchased Prompt</th>
                <th style="text-align: right; padding-bottom: 8px; border-bottom: 2px solid rgba(91,79,207,0.15); color: #5e5a8a; font-size: 0.8rem; text-transform: uppercase;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsListHtml}
              <tr>
                <td style="padding: 16px 0 0 0; font-weight: bold; font-size: 1.1rem; color: #0c0a2e;">Total Paid:</td>
                <td style="padding: 16px 0 0 0; text-align: right; font-weight: 900; font-size: 1.1rem; color: #5b4fcf;">₹${amount}</td>
              </tr>
            </tbody>
          </table>

          <div style="margin-top: 35px; text-align: center;">
            <a href="https://altarvision.in/dashboard/purchases" style="background: linear-gradient(130deg, #5b4fcf 0%, #3b82f6 100%); color: white; padding: 12px 28px; border-radius: 10px; font-weight: bold; text-decoration: none; display: inline-block; box-shadow: 0 4px 12px rgba(91,79,207,0.25);">Access My Prompts</a>
          </div>
          
          <footer style="margin-top: 40px; font-size: 0.75rem; color: #a09ec0; text-align: center; border-t: 1px solid rgba(91,79,207,0.1); pt-20px;">
            © ${new Date().getFullYear()} AltarVision Digital Agency. All rights reserved.
          </footer>
        </div>
      `,
    });

    if (error) {
      console.error("Failed to send purchase confirmation email:", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Purchase email failed:", error);
    return false;
  }
}

export async function sendSupportTicketEmail(
  to: string,
  userName: string,
  ticketSubject: string,
  ticketMessage: string
): Promise<boolean> {
  if (!resend) {
    console.error("Resend API key missing. Support email skipped.");
    return false;
  }

  try {
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: `Support Ticket Received: ${ticketSubject}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 25px; color: #0c0a2e; line-height: 1.6; border-radius: 18px; border: 1px solid rgba(91,79,207,0.15); max-width: 600px; margin: 0 auto; background: #ffffff;">
          <h2 style="color: #5b4fcf; margin-top: 0; font-size: 22px; font-weight: 800;">Ticket Created</h2>
          <p>Hi ${userName},</p>
          <p>We have successfully received your support ticket. Our helpdesk team has been notified and we will reply to your inquiry shortly.</p>
          
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #f1f5f9; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold; color: #64748b; font-size: 0.8rem; text-transform: uppercase;">Ticket Summary:</p>
            <p style="margin-top: 8px; font-weight: bold; color: #1e293b; font-size: 0.95rem;">${ticketSubject}</p>
            <p style="margin-top: 10px; color: #334155; font-size: 0.9rem; line-height: 1.5;">${ticketMessage}</p>
          </div>

          <p style="font-size: 0.85rem; color: #5e5a8a;">You can track this ticket's status and exchange messages directly in your <a href="https://altarvision.in/dashboard/support" style="color: #5b4fcf; font-weight: bold;">dashboard support portal</a>.</p>
          
          <footer style="margin-top: 40px; font-size: 0.75rem; color: #a09ec0; text-align: center; border-t: 1px solid rgba(91,79,207,0.1); pt-20px;">
            © ${new Date().getFullYear()} AltarVision Digital Agency. All rights reserved.
          </footer>
        </div>
      `,
    });

    if (error) {
      console.error("Failed to send support email:", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Support email failed:", error);
    return false;
  }
}
