"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendForgotPasswordEmail = exports.sendVerificationEmail = void 0;
const nodemailer_1 = require("nodemailer");
const html_to_text_1 = require("html-to-text");
// Function to create a Nodemailer transporter with Gmail settings
const createTransporter = () => {
    return (0, nodemailer_1.createTransport)({
        service: "gmail", // Using Gmail as the email service
        auth: {
            user: process.env.EMAIL_USER, // Your Gmail username (email address)
            pass: process.env.EMAIL_PASS, // Your Gmail password or app password
        },
        tls: {
            rejectUnauthorized: false, //This is not recommended for production
        },
    });
};
// Generic function to send emails
const sendEmail = (to, subject, html) => __awaiter(void 0, void 0, void 0, function* () {
    const mailOptions = {
        from: `langu speak <${process.env.EMAIL_USER}>`, // Sender address
        to, // Recipient address
        subject, // Email subject
        html, // HTML body of the email
        text: (0, html_to_text_1.htmlToText)(html), // Plain text version of the email (important for email clients that don't support HTML)
    };
    // Send the email using the created transporter
    return yield createTransporter().sendMail(mailOptions);
});
// Function to send email verification OTP
const sendVerificationEmail = (email, otp) => __awaiter(void 0, void 0, void 0, function* () {
    // HTML content of the verification email with the OTP
    const html = `
    <div>
     <h1>Verify Your Email</h1>
     <p>Your OTP is: <b>${otp}</b> </p>
    </div>  
  `;
    yield sendEmail(email, "Verify your email", html); // Call the generic sendEmail function
});
exports.sendVerificationEmail = sendVerificationEmail;
// Function to send forgot password email with OTP
const sendForgotPasswordEmail = (email, otp) => __awaiter(void 0, void 0, void 0, function* () {
    // HTML content of the forgot password email with the OTP
    const html = `
    <div>
     <h1>Reset Your Password</h1>
        <p>Your OTP is: <b>${otp}</b> </p>
    </div>
  `;
    yield sendEmail(email, "Reset your password", html); // Call the generic sendEmail function
});
exports.sendForgotPasswordEmail = sendForgotPasswordEmail;
