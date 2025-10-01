import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail(to: string, subject: string, text: string) {
  await transporter.sendMail({
    from: `"Project Manager" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
  });
}
