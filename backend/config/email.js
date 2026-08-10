const nodemailer = require("nodemailer");

// ==========================================
// CREATE EMAIL TRANSPORTER
// ==========================================

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,

  // Port 587 = STARTTLS
  secure: Number(process.env.SMTP_PORT) === 465,

  // Force IPv4
  family: 4,

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },

  // Timeouts
  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000,
});

// ==========================================
// SEND EMAIL
// ==========================================

const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });

    console.log("Email sent:", info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("Email sending error:", error);

    throw error;
  }
};

module.exports = sendEmail;
