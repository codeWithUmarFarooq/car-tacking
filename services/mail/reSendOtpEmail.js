import transporter from "../../config/nodemon.js";

import dotenv from 'dotenv';
dotenv.config()


export function sendOtpEmail(to, userName, otp) {
    const mailOptions = {
        from: `"${process.env.APP_NAME}" <${process.env.SENDER_EMAIL}>`,
        to,
        subject: "Your OTP for Email Verification",
        html: generateOtpEmailTemplate(userName, otp),
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.error("Failed to send OTP email:", err);
        } else {
            console.log("OTP email sent successfully:", info.response);
        }
    });
}


export const generateOtpEmailTemplate = (userName, otp) => {
    return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Resend OTP</title>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f2f4f6;
        margin: 0;
        padding: 0;
        color: #333;
      }
      .container {
        max-width: 600px;
        margin: 50px auto;
        background-color: #ffffff;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        padding: 30px;
      }
      .header {
        font-size: 22px;
        font-weight: 700;
        color: #2c3e50;
        margin-bottom: 20px;
      }
      .content {
        font-size: 16px;
        line-height: 1.7;
      }
      .otp-box {
        background-color: #f0f5ff;
        color: #1a73e8;
        padding: 15px 25px;
        display: inline-block;
        border-radius: 8px;
        font-weight: bold;
        font-size: 24px;
        letter-spacing: 2px;
        margin: 25px 0;
      }
      .footer {
        font-size: 14px;
        color: #999;
        margin-top: 40px;
        border-top: 1px solid #eee;
        padding-top: 20px;
      }
      .brand {
        color: #1a73e8;
        font-weight: bold;
      }
      a {
        color: #1a73e8;
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">Your OTP Code</div>
      <div class="content">
        <p>Hello ${userName},</p>
        <p>As requested, here is your One-Time Password (OTP):</p>
        <div class="otp-box">${otp}</div>
        <p>This OTP is valid for 10 minutes. Do not share this code with anyone.</p>
        <p>If you did not request this OTP, please ignore this email or contact our support team.</p>
        <p>Need help? Reach out to us at <a href="mailto:${process.env.SUPPORT_EMAIL}">${process.env.SUPPORT_EMAIL}</a>.</p>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} ${process.env.APP_NAME}. All rights reserved.
      </div>
    </div>
  </body>
  </html>`;
};

