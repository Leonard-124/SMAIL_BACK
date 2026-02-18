

// const nodemailer = require("nodemailer");

// require('dotenv').config()

// // Brevo (formerly Sendinblue) SMTP configuration
// const transporter = nodemailer.createTransport({  //was nodemailer.createTransporter
//   host: process.env.BREVO_SMTP_HOST || "smtp-relay.brevo.com",
//   port: parseInt(process.env.BREVO_SMTP_PORT || "587"),
//   secure: false, // Use TLS
//   auth: {
//     user: process.env.BREVO_SMTP_USER,
//     pass: process.env.BREVO_SMTP_PASSWORD,
//   },
// });

// // Verify transporter configuration on startup
// transporter.verify((error, success) => {
//   if (error) {
//     console.error("❌ Email service configuration error:", error.message);
//   } else {
//     console.log("✅ Email service ready");
//   }
// });

// /**
//  * Send password reset code email
//  */
// async function sendPasswordResetEmail({ to, username, code, token }) {
//   const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  
//   const mailOptions = {
//     from: `"${process.env.BREVO_SENDER_NAME || "Almo Farm"}" <${process.env.BREVO_SENDER_EMAIL}>`,
//     to,
//     subject: "Reset Your Almo Farm Password",
//     html: `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <style>
//           body { font-family: 'Lato', -apple-system, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #fafaf7; }
//           .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
//           .header { background: linear-gradient(135deg, #1a4731, #2d6a4f); color: white; padding: 40px 30px; text-align: center; }
//           .header h1 { margin: 0; font-family: 'Playfair Display', serif; font-size: 28px; font-weight: bold; }
//           .header p { margin: 8px 0 0; opacity: 0.9; font-size: 14px; }
//           .content { padding: 40px 30px; }
//           .greeting { font-size: 18px; font-weight: 600; color: #1a4731; margin-bottom: 20px; }
//           .message { color: #555; margin-bottom: 30px; font-size: 15px; }
//           .code-box { background: #e8f5e9; border: 2px solid #52b788; border-radius: 12px; padding: 24px; text-align: center; margin: 30px 0; }
//           .code-label { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #2d6a4f; font-weight: 700; margin-bottom: 12px; }
//           .code { font-size: 36px; font-weight: bold; color: #1a4731; letter-spacing: 6px; font-family: 'Courier New', monospace; }
//           .button { display: inline-block; background: linear-gradient(135deg, #1a4731, #2d6a4f); color: white; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; margin: 20px 0; transition: opacity 0.2s; }
//           .button:hover { opacity: 0.9; }
//           .divider { height: 1px; background: #e0e0e0; margin: 30px 0; }
//           .footer { background: #f8f8f8; padding: 30px; text-align: center; font-size: 13px; color: #666; }
//           .footer a { color: #2d6a4f; text-decoration: none; }
//           .warning { background: #fff8e1; border-left: 4px solid #ffa726; padding: 16px; border-radius: 8px; margin: 20px 0; font-size: 14px; color: #555; }
//         </style>
//       </head>
//       <body>
//         <div class="container">
//           <div class="header">
//             <h1>🌿 Almo Farm</h1>
//             <p>From our Farms, to your Family</p>
//           </div>
          
//           <div class="content">
//             <div class="greeting">Hello ${username || "there"},</div>
            
//             <div class="message">
//               We received a request to reset your password. Use the verification code below to complete the process:
//             </div>
            
//             <div class="code-box">
//               <div class="code-label">Your Reset Code</div>
//               <div class="code">${code}</div>
//             </div>
            
//             <div class="message">
//               Enter this code on the password reset page. It will expire in <strong>15 minutes</strong>.
//             </div>
            
//             <div style="text-align: center;">
//               <a href="${resetUrl}" class="button">Reset Password Now</a>
//             </div>
            
//             <div class="divider"></div>
            
//             <div class="warning">
//               <strong>⚠️ Didn't request this?</strong><br>
//               If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
//             </div>
            
//             <div class="message" style="font-size: 13px; color: #888; margin-top: 20px;">
//               For security, this link will expire in 15 minutes. If you need a new code, you can request another one on our website.
//             </div>
//           </div>
          
//           <div class="footer">
//             <p style="margin: 0 0 10px;"><strong>Almo Farm Produce Suppliers</strong></p>
//             <p style="margin: 0 0 10px;">Fresh produce from Kenya's highlands</p>
//             <p style="margin: 0;">
//               <a href="https://wa.me/+254798878676">WhatsApp: 0798 878 676</a> | 
//               <a href="https://wa.me/+254717188268">0717 188 268</a>
//             </p>
//           </div>
//         </div>
//       </body>
//       </html>
//     `,
//     text: `
// Hello ${username || "there"},

// We received a request to reset your Almo Farm password.

// Your password reset code is: ${code}

// This code will expire in 15 minutes.

// Alternatively, you can reset your password by visiting:
// ${resetUrl}

// If you didn't request this, please ignore this email.

// ---
// Almo Farm Produce Suppliers
// From our Farms, to your Family
// WhatsApp: 0798 878 676 | 0717 188 268
//     `.trim(),
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log("✅ Password reset email sent:", info.messageId);
//     return { success: true, messageId: info.messageId };
//   } catch (error) {
//     console.error("❌ Failed to send password reset email:", error.message);
//     throw new Error("Failed to send email. Please try again later.");
//   }
// }

// /**
//  * Send welcome email (optional - for new registrations)
//  */
// async function sendWelcomeEmail({ to, username }) {
//   const mailOptions = {
//     from: `"${process.env.BREVO_SENDER_NAME || "Almo Farm"}" <${process.env.BREVO_SENDER_EMAIL}>`,
//     to,
//     subject: "Welcome to Almo Farm! 🌿",
//     html: `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <style>
//           body { font-family: 'Lato', -apple-system, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #fafaf7; }
//           .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
//           .header { background: linear-gradient(135deg, #1a4731, #2d6a4f); color: white; padding: 40px 30px; text-align: center; }
//           .header h1 { margin: 0; font-family: 'Playfair Display', serif; font-size: 32px; font-weight: bold; }
//           .content { padding: 40px 30px; }
//           .greeting { font-size: 22px; font-weight: 600; color: #1a4731; margin-bottom: 20px; }
//           .button { display: inline-block; background: linear-gradient(135deg, #1a4731, #2d6a4f); color: white; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; margin: 20px 0; }
//           .footer { background: #f8f8f8; padding: 30px; text-align: center; font-size: 13px; color: #666; }
//         </style>
//       </head>
//       <body>
//         <div class="container">
//           <div class="header">
//             <h1>Welcome to Almo Farm! 🌿</h1>
//           </div>
//           <div class="content">
//             <div class="greeting">Hello ${username}!</div>
//             <p>Thank you for joining Kenya's trusted farm produce supplier. We're excited to bring fresh, organic produce from our highlands directly to your family.</p>
//             <div style="text-align: center; margin: 30px 0;">
//               <a href="${process.env.FRONTEND_URL}/order" class="button">Start Shopping</a>
//             </div>
//             <p style="color: #666; font-size: 14px;">If you have any questions, feel free to reach out via WhatsApp at 0798 878 676 or 0717 188 268.</p>
//           </div>
//           <div class="footer">
//             <p><strong>Almo Farm</strong> | From our Farms, to your Family</p>
//           </div>
//         </div>
//       </body>
//       </html>
//     `,
//     text: `Welcome to Almo Farm, ${username}! Start shopping at ${process.env.FRONTEND_URL}/order`,
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log("✅ Welcome email sent:", info.messageId);
//     return { success: true };
//   } catch (error) {
//     console.error("❌ Failed to send welcome email:", error.message);
//     // Don't throw - welcome email is non-critical
//     return { success: false };
//   }
// }

// module.exports = {
//   sendPasswordResetEmail,
//   sendWelcomeEmail,
// };

/////////////////////////////////////////////////////////////////////

const nodemailer = require("nodemailer");
require('dotenv').config()

// Validate required environment variables
const requiredEnvVars = [
  "BREVO_SMTP_USER",
  "BREVO_SMTP_PASSWORD",
  "BREVO_SENDER_EMAIL",
];

const missingVars = requiredEnvVars.filter((v) => !process.env[v]);
if (missingVars.length > 0) {
  console.error(
    `❌ Missing required email environment variables: ${missingVars.join(", ")}`
  );
  console.error("   Please check your .env file");
}
console.log('🔍 DEBUG - Actual password being used:', process.env.BREVO_SMTP_PASSWORD);

// Brevo (formerly Sendinblue) SMTP configuration
const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST || "smtp-relay.brevo.com",
  port: parseInt(process.env.BREVO_SMTP_PORT || "587"),
  secure: false, // Use TLS
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASSWORD,
  },
  // Add debug logging in development
  debug: process.env.NODE_ENV !== "production",
  logger: process.env.NODE_ENV !== "production",
});

// Verify transporter configuration on startup
if (process.env.BREVO_SMTP_USER && process.env.BREVO_SMTP_PASSWORD) {
  transporter.verify((error, success) => {
    if (error) {
      console.error("❌ Email service configuration error:", error.message);
      console.error("\n📧 Brevo SMTP Setup Help:");
      console.error("   1. Go to https://app.brevo.com/settings/keys/smtp");
      console.error("   2. Copy your SMTP login (email format)");
      console.error("   3. Generate a new SMTP key (or use existing)");
      console.error("   4. Add to .env:");
      console.error("      BREVO_SMTP_USER=your-login@example.com");
      console.error("      BREVO_SMTP_PASSWORD=xsmtpsib-...(your-smtp-key)");
      console.error(
        "      BREVO_SENDER_EMAIL=noreply@yourdomain.com (must be verified)"
      );
      console.error("\n   Current config:");
      console.error(`      User: ${process.env.BREVO_SMTP_USER}`);
      console.error(
        `      Pass: ${process.env.BREVO_SMTP_PASSWORD ? "***" + process.env.BREVO_SMTP_PASSWORD.slice(-4) : "(not set)"}`
      );
      console.error(`      From: ${process.env.BREVO_SENDER_EMAIL}`);
    } else {
      console.log("✅ Email service ready");
    }
  });
} else {
  console.warn("⚠️  Email service disabled (missing credentials)");
}

/**
 * Send password reset code email
 */
async function sendPasswordResetEmail({ to, username, code, token }) {
  if (!process.env.BREVO_SMTP_USER || !process.env.BREVO_SMTP_PASSWORD) {
    throw new Error(
      "Email service not configured. Please add Brevo credentials to .env"
    );
  }

  const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5174"}/reset-password?token=${token}`;

  const mailOptions = {
    from: `"${process.env.BREVO_SENDER_NAME || "Almo Farm"}" <${process.env.BREVO_SENDER_EMAIL}>`,
    to,
    subject: "Reset Your Almo Farm Password",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Lato', -apple-system, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #fafaf7; }
          .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #1a4731, #2d6a4f); color: white; padding: 40px 30px; text-align: center; }
          .header h1 { margin: 0; font-family: 'Playfair Display', serif; font-size: 28px; font-weight: bold; }
          .header p { margin: 8px 0 0; opacity: 0.9; font-size: 14px; }
          .content { padding: 40px 30px; }
          .greeting { font-size: 18px; font-weight: 600; color: #1a4731; margin-bottom: 20px; }
          .message { color: #555; margin-bottom: 30px; font-size: 15px; }
          .code-box { background: #e8f5e9; border: 2px solid #52b788; border-radius: 12px; padding: 24px; text-align: center; margin: 30px 0; }
          .code-label { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #2d6a4f; font-weight: 700; margin-bottom: 12px; }
          .code { font-size: 36px; font-weight: bold; color: #1a4731; letter-spacing: 6px; font-family: 'Courier New', monospace; }
          .button { display: inline-block; background: linear-gradient(135deg, #1a4731, #2d6a4f); color: white; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; margin: 20px 0; transition: opacity 0.2s; }
          .button:hover { opacity: 0.9; }
          .divider { height: 1px; background: #e0e0e0; margin: 30px 0; }
          .footer { background: #f8f8f8; padding: 30px; text-align: center; font-size: 13px; color: #666; }
          .footer a { color: #2d6a4f; text-decoration: none; }
          .warning { background: #fff8e1; border-left: 4px solid #ffa726; padding: 16px; border-radius: 8px; margin: 20px 0; font-size: 14px; color: #555; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌿 Almo Farm</h1>
            <p>From our Farms, to your Family</p>
          </div>
          
          <div class="content">
            <div class="greeting">Hello ${username || "there"},</div>
            
            <div class="message">
              We received a request to reset your password. Use the verification code below to complete the process:
            </div>
            
            <div class="code-box">
              <div class="code-label">Your Reset Code</div>
              <div class="code">${code}</div>
            </div>
            
            <div class="message">
              Enter this code on the password reset page. It will expire in <strong>15 minutes</strong>.
            </div>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password Now</a>
            </div>
            
            <div class="divider"></div>
            
            <div class="warning">
              <strong>⚠️ Didn't request this?</strong><br>
              If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
            </div>
            
            <div class="message" style="font-size: 13px; color: #888; margin-top: 20px;">
              For security, this link will expire in 15 minutes. If you need a new code, you can request another one on our website.
            </div>
          </div>
          
          <div class="footer">
            <p style="margin: 0 0 10px;"><strong>Almo Farm Produce Suppliers</strong></p>
            <p style="margin: 0 0 10px;">Fresh produce from Kenya's highlands</p>
            <p style="margin: 0;">
              <a href="https://wa.me/+254798878676">WhatsApp: 0798 878 676</a> | 
              <a href="https://wa.me/+254717188268">0717 188 268</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Hello ${username || "there"},

We received a request to reset your Almo Farm password.

Your password reset code is: ${code}

This code will expire in 15 minutes.

Alternatively, you can reset your password by visiting:
${resetUrl}

If you didn't request this, please ignore this email.

---
Almo Farm Produce Suppliers
From our Farms, to your Family
WhatsApp: 0798 878 676 | 0717 188 268
    `.trim(),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Password reset email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Failed to send password reset email:", error.message);
    
    // More helpful error messages
    if (error.message.includes("535")) {
      throw new Error(
        "Email authentication failed. Please verify your Brevo SMTP credentials in .env"
      );
    } else if (error.message.includes("550")) {
      throw new Error(
        "Sender email not verified. Please verify your sender email in Brevo dashboard"
      );
    } else {
      throw new Error("Failed to send email. Please try again later.");
    }
  }
}

/**
 * Send welcome email (optional - for new registrations)
 */
async function sendWelcomeEmail({ to, username }) {
  if (!process.env.BREVO_SMTP_USER || !process.env.BREVO_SMTP_PASSWORD) {
    console.warn("⚠️  Skipping welcome email (email service not configured)");
    return { success: false };
  }

  const mailOptions = {
    from: `"${process.env.BREVO_SENDER_NAME || "Almo Farm"}" <${process.env.BREVO_SENDER_EMAIL}>`,
    to,
    subject: "Welcome to Almo Farm! 🌿",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Lato', -apple-system, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #fafaf7; }
          .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #1a4731, #2d6a4f); color: white; padding: 40px 30px; text-align: center; }
          .header h1 { margin: 0; font-family: 'Playfair Display', serif; font-size: 32px; font-weight: bold; }
          .content { padding: 40px 30px; }
          .greeting { font-size: 22px; font-weight: 600; color: #1a4731; margin-bottom: 20px; }
          .button { display: inline-block; background: linear-gradient(135deg, #1a4731, #2d6a4f); color: white; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; margin: 20px 0; }
          .footer { background: #f8f8f8; padding: 30px; text-align: center; font-size: 13px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Almo Farm! 🌿</h1>
          </div>
          <div class="content">
            <div class="greeting">Hello ${username}!</div>
            <p>Thank you for joining Kenya's trusted farm produce supplier. We're excited to bring fresh, organic produce from our highlands directly to your family.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || "http://localhost:5174"}/order" class="button">Start Shopping</a>
            </div>
            <p style="color: #666; font-size: 14px;">If you have any questions, feel free to reach out via WhatsApp at 0798 878 676 or 0717 188 268.</p>
          </div>
          <div class="footer">
            <p><strong>Almo Farm</strong> | From our Farms, to your Family</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Welcome to Almo Farm, ${username}! Start shopping at ${process.env.FRONTEND_URL || "http://localhost:5174"}/order`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Welcome email sent:", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("❌ Failed to send welcome email:", error.message);
    // Don't throw - welcome email is non-critical
    return { success: false };
  }
}

module.exports = {
  sendPasswordResetEmail,
  sendWelcomeEmail,
};