const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email", // Replace with real SMTP or use Ethereal for dev
    port: 587,
    secure: false,
    auth: {
        user: "test@ethereal.email", // Replace
        pass: "test" // Replace
    }
});

// Note: For production, use environment variables for credentials.
// For this task, I'll assume we might need to configure this properly later.

const sendMail = async (to, subject, html) => {
    try {
        const info = await transporter.sendMail({
            from: '"AppCenar" <no-reply@appcenar.com>',
            to,
            subject,
            html
        });
        console.log("Message sent: %s", info.messageId);
    } catch (error) {
        console.error("Error sending email: ", error);
    }
};

module.exports = { sendMail };
