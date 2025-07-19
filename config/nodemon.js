import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER || "umar150704@gmail.com",
        pass: process.env.SMTP_PASSWORD || "ioxpbvudjoghmwor", // NOT your Gmail password — use an App Password if 2FA is enabled
    },
});

export default transporter;