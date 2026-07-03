import nodemailer from 'nodemailer';
import env from './env.js';

const transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465, // true for 465, false for other ports (like 587, 2525)
    auth: {
        user: env.smtp.user,
        pass: env.smtp.pass,
    },
});

export default transporter;
