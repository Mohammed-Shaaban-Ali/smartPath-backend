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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendForgotPasswordEmail = exports.sendVerificationEmail = exports.sendEmail = void 0;
const nodemailer_1 = require("nodemailer");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Function to create a Nodemailer transporter with Gmail settings
const createTransporter = () => {
    return (0, nodemailer_1.createTransport)({
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
const sendEmail = (to, subject, html) => __awaiter(void 0, void 0, void 0, function* () {
    const mailOptions = {
        from: `Smart Path <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
        text: html,
    };
    // Send the email using the created transporter
    return yield createTransporter().sendMail(mailOptions);
});
exports.sendEmail = sendEmail;
// Function to send email verification OTP
const sendVerificationEmail = (name, email, otp) => __awaiter(void 0, void 0, void 0, function* () {
    const templatePath = path_1.default.join(__dirname, "..", "templates", "otp-verify.html");
    let html = fs_1.default.readFileSync(templatePath, "utf8");
    const otpAsHtml = otp
        .split("")
        .map((num) => {
        return `<td class="otp-cell-wrapper"><div class="otp-cell">${num}</div></td>`;
    })
        .join("");
    html = html.replace("USER_NAME", name);
    html = html.replace(`<tr id="OTP_TR"></tr>`, `<tr id="OTP_TR">${otpAsHtml}</tr>`);
    yield (0, exports.sendEmail)(email, "Verify your email", html);
});
exports.sendVerificationEmail = sendVerificationEmail;
// Function to send forgot password email with OTP
const sendForgotPasswordEmail = (email, otp) => __awaiter(void 0, void 0, void 0, function* () {
    const html = `
    <div>
     <h1>Reset Your Password</h1>
        <p>Your OTP is: <b>${otp}</b> </p>
    </div>
  `;
    yield (0, exports.sendEmail)(email, "Reset your password", html);
});
exports.sendForgotPasswordEmail = sendForgotPasswordEmail;
