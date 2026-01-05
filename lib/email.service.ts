import nodemailer from "nodemailer";
import { toast } from "sonner";

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SERVICE } = process.env;
    // Initialize transporter if SMTP config is available
    if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
      const port = parseInt(SMTP_PORT || '587');
      this.transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: port,
        secure: port === 465, // true for 465, false for other ports
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
        // Only add service if explicitly provided
        ...(SMTP_SERVICE ? { service: SMTP_SERVICE } : {}),
      });
    } else {
      toast.error("Email service not configured: SMTP credentials missing");
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      toast.error("Email service not configured, skipping email send");
      return false;
    }

    try {
      const from = process.env.SMTP_USER || 'noreply@zestwear.com';
      const mailOptions = {
        from: `"Zest Wear" <${from}>`,
        to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      toast.success(`Email sent successfully: ${info.messageId}`);
      return true;
    } catch (error) {
      toast.error(`Failed to send email: ${error}`);
      return false;
    }
  }


  // Booking confirmation email (Adapted for Zest Wear - Order Confirmation)
  async sendOrderCompletedEmail(
    userEmail: string,
    userName: string,
    orderDetails: {
      orderId: string;
      totalPrice: number;
      status: string;
      itemsCount: number;
    }
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Order Completed successfully</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2c3e50;">Order Completed successfully</h2>
            <p>Dear ${userName},</p>
            <p>Your order has been completed!</p>
            <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Order Details:</h3>
              <p><strong>Order ID:</strong> #${orderDetails.orderId.slice(-6)}</p>
              <p><strong>Items:</strong> ${orderDetails.itemsCount}</p>
              <p><strong>Total:</strong> ৳${orderDetails.totalPrice.toLocaleString()}</p>
              <p><strong>Status:</strong> ${orderDetails.status}</p>
            </div>
            <p>Thank you for shopping with Zest Wear!</p>
            <p>Best regards,<br>Zest Wear Team</p>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: "Order Completed successfully - Zest Wear",
      html,
    });
  }

  // Status update notification
  async sendOrderStatusUpdate(
    userEmail: string,
    userName: string,
    orderDetails: {
      orderId: string;
      status: string;
    }
  ): Promise<boolean> {
    const statusMessages: Record<string, string> = {
      PROCESSING: "Your order is being processed.",
      SHIPPED: "Your order has been shipped!",
      DELIVERED: "Your order has been delivered using our fast delivery.",
      CANCELLED: "Your order has been cancelled.",
    };

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Order Status Update</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2c3e50;">Order Status Update</h2>
            <p>Dear ${userName},</p>
            <p>${
              statusMessages[orderDetails.status] ||
              "Your order status has been updated."
            }</p>
            <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Order ID:</strong> #${orderDetails.orderId.slice(-6)}</p>
              <p><strong>Status:</strong> ${orderDetails.status}</p>
            </div>
            <p>Thank you for shopping with Zest Wear!</p>
            <p>Best regards,<br>Zest Wear Team</p>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: `Order Status Update - ${orderDetails.status} - Zest Wear`,
      html,
    });
  }
}

export const emailService = new EmailService();
