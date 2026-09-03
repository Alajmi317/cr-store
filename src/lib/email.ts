import nodemailer from "nodemailer";

function transport() {
  if (!process.env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
}

export async function sendMail(opts: { to: string; subject: string; html: string }) {
  const t = transport();
  if (!t) {
    console.info("[email:skipped]", opts.subject, opts.to);
    return { skipped: true };
  }
  await t.sendMail({
    from: process.env.SMTP_FROM || "CR Store <noreply@localhost>",
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  });
  return { skipped: false };
}

export const templates = {
  welcome: (name: string) => ({
    subject: "Welcome to CR Store",
    html: `<h2>Welcome ${name}</h2><p>Your CR Store account is ready.</p>`,
  }),
  verify: (name: string, url: string) => ({
    subject: "Verify your CR Store email",
    html: `<h2>Hi ${name}</h2><p>Confirm your email:</p><p><a href="${url}">${url}</a></p>`,
  }),
  reset: (url: string) => ({
    subject: "Reset your CR Store password",
    html: `<p>Reset your password using this link (valid 1 hour):</p><p><a href="${url}">${url}</a></p>`,
  }),
  order: (number: string, total: string) => ({
    subject: `Order ${number} confirmed`,
    html: `<h2>Payment confirmed</h2><p>Order ${number}</p><p>Total ${total}</p><p>Your files are available in Downloads.</p>`,
  }),
  ticketReply: (number: string) => ({
    subject: `New reply on ticket ${number}`,
    html: `<p>There is a new reply on ticket ${number}.</p>`,
  }),
};
