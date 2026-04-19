import nodemailer from "nodemailer";

// ─── Transporter ─────────────────────────────────────────────────────────────
function createTransporter() {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // SSL
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD, // Gmail App Password (not your Google password)
    },
  });
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 
  (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : "http://localhost:3000");

const fromAddress = process.env.GMAIL_USER || "noreply@artelier.com";
const fromName = "Artelier";

// ─── Base HTML wrapper ────────────────────────────────────────────────────────
function htmlWrapper(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { margin: 0; padding: 0; background: #f4f4f4; font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a1a; }
    .container { max-width: 600px; margin: 32px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 16px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #0d9488, #059669); padding: 32px 40px; }
    .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: 2px; }
    .body { padding: 36px 40px; }
    .body h2 { margin-top: 0; font-size: 20px; }
    .btn { display: inline-block; margin: 24px 0; padding: 14px 32px; background: #0d9488; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; }
    .divider { border: none; border-top: 1px solid #e5e7eb; margin: 24px 0; }
    .footer { padding: 20px 40px; background: #f9fafb; text-align: center; font-size: 12px; color: #9ca3af; }
    .item-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; background: #d1fae5; color: #065f46; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ARTELIER</h1>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Artelier. All rights reserved.<br/>
      <a href="${siteUrl}" style="color:#0d9488;">${siteUrl}</a>
    </div>
  </div>
</body>
</html>`;
}

// ─── Email Senders ────────────────────────────────────────────────────────────

/**
 * Send email verification link to newly registered user.
 */
export async function sendVerificationEmail(to: string, name: string, token: string) {
  const verifyUrl = `${siteUrl}/api/auth/verify-email?token=${token}`;
  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"${fromName}" <${fromAddress}>`,
    to,
    subject: "Verify your Artelier email address",
    html: htmlWrapper(`
      <h2>Welcome to Artelier, ${name}! 🎨</h2>
      <p>Thanks for signing up. Please verify your email address to activate your account.</p>
      <a href="${verifyUrl}" class="btn">Verify Email Address</a>
      <hr class="divider" />
      <p style="font-size:13px;color:#6b7280;">This link expires in <strong>24 hours</strong>. If you did not create an account, you can safely ignore this email.</p>
    `),
  });
}

/**
 * Send password reset email.
 */
export async function sendPasswordResetEmail(to: string, name: string, token: string) {
  const resetUrl = `${siteUrl}/auth/reset-password/${token}`;
  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"${fromName}" <${fromAddress}>`,
    to,
    subject: "Reset your Artelier password",
    html: htmlWrapper(`
      <h2>Password Reset Request</h2>
      <p>Hi ${name}, we received a request to reset your password.</p>
      <a href="${resetUrl}" class="btn">Reset Password</a>
      <hr class="divider" />
      <p style="font-size:13px;color:#6b7280;">This link expires in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email.</p>
    `),
  });
}

interface OrderItem {
  titleSnapshot: string;
  quantity: number;
  unitPrice: number;
  productType: string;
}

interface OrderEmailData {
  id: string;
  customerName?: string | null;
  email: string;
  total: number;
  currency: string;
  items: OrderItem[];
}

/**
 * Send order confirmation to the buyer.
 */
export async function sendOrderConfirmationEmail(order: OrderEmailData) {
  const transporter = createTransporter();
  const itemsHtml = order.items.map(item => `
    <div class="item-row">
      <span>${item.titleSnapshot} × ${item.quantity} <span style="font-size:11px;color:#6b7280;">(${item.productType})</span></span>
      <span style="font-weight:600;">${order.currency} ${(item.unitPrice * item.quantity / 100).toLocaleString()}</span>
    </div>
  `).join("");

  await transporter.sendMail({
    from: `"${fromName}" <${fromAddress}>`,
    to: order.email,
    subject: `Your Artelier order #${order.id.slice(-8).toUpperCase()} is confirmed 🎉`,
    html: htmlWrapper(`
      <h2>Order Confirmed! 🎉</h2>
      <p>Hi ${order.customerName || "there"}, thank you for your purchase. Your order has been received and is being processed.</p>
      <p><strong>Order ID:</strong> #${order.id.slice(-8).toUpperCase()}</p>
      ${itemsHtml}
      <hr class="divider" />
      <div class="item-row">
        <strong>Total</strong>
        <strong>${order.currency} ${(order.total / 100).toLocaleString()}</strong>
      </div>
      <a href="${siteUrl}/user/dashboard" class="btn">View My Orders</a>
      <p style="font-size:13px;color:#6b7280;">Questions? Reply to this email or visit our site.</p>
    `),
  });
}

interface ArtistOrderItem extends OrderItem {
  artworkTitle: string;
}

/**
 * Notify an artist that one of their artworks was sold.
 */
export async function sendArtistOrderNotificationEmail(
  to: string,
  artistName: string,
  orderId: string,
  items: ArtistOrderItem[],
  currency: string
) {
  const transporter = createTransporter();
  const itemsHtml = items.map(item => `
    <div class="item-row">
      <span>${item.titleSnapshot} × ${item.quantity}</span>
      <span style="font-weight:600;">${currency} ${(item.unitPrice * item.quantity / 100).toLocaleString()}</span>
    </div>
  `).join("");

  const total = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  await transporter.sendMail({
    from: `"${fromName}" <${fromAddress}>`,
    to,
    subject: `🎨 You made a sale! Order #${orderId.slice(-8).toUpperCase()}`,
    html: htmlWrapper(`
      <h2>You made a sale! 🎨</h2>
      <p>Hi ${artistName}, great news — someone just purchased your artwork on Artelier!</p>
      <p><strong>Order ID:</strong> #${orderId.slice(-8).toUpperCase()}</p>
      ${itemsHtml}
      <hr class="divider" />
      <div class="item-row">
        <strong>Your earnings</strong>
        <strong>${currency} ${(total / 100).toLocaleString()}</strong>
      </div>
      <a href="${siteUrl}/artist/dashboard" class="btn">View Dashboard</a>
    `),
  });
}

/**
 * Notify an artist that someone has sent them a commission request.
 */
export async function sendCommissionRequestEmail(
  to: string,
  artistName: string,
  commission: { id: string; name: string; email: string; details: string }
) {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"${fromName}" <${fromAddress}>`,
    to,
    subject: `🖌️ New commission request from ${commission.name}`,
    html: htmlWrapper(`
      <h2>New Commission Request</h2>
      <p>Hi ${artistName}, someone would like to commission you!</p>
      <hr class="divider" />
      <p><strong>From:</strong> ${commission.name} (<a href="mailto:${commission.email}" style="color:#0d9488;">${commission.email}</a>)</p>
      <p><strong>Details:</strong></p>
      <blockquote style="margin:12px 0;padding:12px 16px;background:#f9fafb;border-left:4px solid #0d9488;border-radius:4px;color:#374151;">
        ${commission.details.replace(/\n/g, "<br/>")}
      </blockquote>
      <a href="${siteUrl}/admin/commissions" class="btn">View in Dashboard</a>
      <p style="font-size:13px;color:#6b7280;">You can reply directly to this email or contact the client at ${commission.email}.</p>
    `),
    replyTo: commission.email,
  });
}

/**
 * Notify a client about a commission status update.
 */
export async function sendCommissionStatusUpdateEmail(
  to: string,
  clientName: string,
  newStatus: string
) {
  const transporter = createTransporter();

  // Make status human readable
  const readableStatus: Record<string, string> = {
    NEW: "New",
    IN_REVIEW: "In Review",
    INVOICE_SENT: "Invoice Sent",
    PAID: "Paid",
    REJECTED: "Declined"
  };

  await transporter.sendMail({
    from: `"${fromName}" <${fromAddress}>`,
    to,
    subject: `Update on your commission request`,
    html: htmlWrapper(`
      <h2>Commission Request Update</h2>
      <p>Hi ${clientName},</p>
      <p>The status of your commission request has been updated to: <strong>${readableStatus[newStatus] || newStatus}</strong>.</p>
      <hr class="divider" />
      <p style="font-size:13px;color:#6b7280;">If you have any questions, feel free to reply directly to this email.</p>
    `),
  });
}

/**
 * Notify a buyer about an order status update (e.g., shipped).
 */
export async function sendOrderStatusUpdateEmail(
  to: string,
  clientName: string,
  orderId: string,
  newStatus: string
) {
  const transporter = createTransporter();

  // Make status human readable
  const readableStatus: Record<string, string> = {
    PENDING: "Pending",
    PAID: "Paid & Processing",
    PENDING_DELIVERY: "Shipped / Ready for Delivery",
    FULFILLED: "Fulfilled",
    CANCELED: "Canceled"
  };

  let extraMessage = "";
  if (newStatus === "PENDING_DELIVERY") {
    extraMessage = "<p>Great news! Your order is on its way. The artist has marked it as shipped or ready for delivery.</p>";
  } else if (newStatus === "FULFILLED") {
    extraMessage = "<p>Your order has been marked as fulfilled. We hope you love your new artwork!</p>";
  } else {
    extraMessage = "<p>Your order status has been updated.</p>";
  }

  await transporter.sendMail({
    from: `"${fromName}" <${fromAddress}>`,
    to,
    subject: `Update on your order #${orderId.slice(-8).toUpperCase()}`,
    html: htmlWrapper(`
      <h2>Order Status Update</h2>
      <p>Hi ${clientName},</p>
      ${extraMessage}
      <p>The status of your order #${orderId.slice(-8).toUpperCase()} is now: <strong>${readableStatus[newStatus] || newStatus}</strong>.</p>
      <a href="${siteUrl}/user/orders" class="btn">View Order History</a>
      <hr class="divider" />
      <p style="font-size:13px;color:#6b7280;">If you have any questions, feel free to reply directly to this email.</p>
    `),
  });
}
