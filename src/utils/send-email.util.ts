import { createTransport } from "nodemailer";
import path from "path";
import fs from "fs";

// Function to create a Nodemailer transporter with Gmail settings
const createTransporter = () => {
  return createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: true,
    },
  });
};

// Generic function to send emails
export const sendEmail = async (to: string, subject: string, html: string) => {
  const mailOptions = {
    from: `Smart Path <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    text: html,
  };
  // Send the email using the created transporter
  return await createTransporter().sendMail(mailOptions);
};

// Function to send email verification OTP
export const sendVerificationEmail = async (
  name: string,
  email: string,
  otp: string
) => {
  const templatePath = path.join(
    __dirname,
    "..",
    "templates",
    "otp-verify.html"
  );
  let html = fs.readFileSync(templatePath, "utf8");
  const otpAsHtml = otp
    .split("")
    .map((num) => {
      return `<td class="otp-cell-wrapper"><div class="otp-cell">${num}</div></td>`;
    })
    .join("");

  html = html.replace("USER_NAME", name);

  html = html.replace(
    `<tr id="OTP_TR"></tr>`,
    `<tr id="OTP_TR">${otpAsHtml}</tr>`
  );

  await sendEmail(email, "Verify your email", html);
};

// Function to send forgot password email with OTP
export const sendForgotPasswordEmail = async (email: string, otp: string) => {
  const html = `
    <div>
     <h1>Reset Your Password</h1>
        <p>Your OTP is: <b>${otp}</b> </p>
    </div>
  `;
  await sendEmail(email, "Reset your password", html);
};
