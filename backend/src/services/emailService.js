import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import handlebars from "handlebars";

import { fileURLToPath } from "url";
import { dirname } from "path";
import dotenv from 'dotenv';
dotenv.config();

const MAIL_APP_PWD = process.env.MAIL_APP_PWD;
const MAIL_APP_EMAIL = process.env.MAIL_APP_EMAIL;
//const VITE_SERVER = process.env.VITE_SERVER;
//const MAIL_APP_FILE_SERVER_PUBLIC = process.env.MAIL_APP_FILE_SERVER;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// --- 1. Create transporter ---
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: MAIL_APP_EMAIL,
    pass: MAIL_APP_PWD
  }
});

// --- 2. Function to compile template with common heading ---
function getTemplate(templateName, data) {
  const filePath = path.join(__dirname, "templates", `${templateName}.hbs`);
  const source = fs.readFileSync(filePath, "utf8");
  const template = handlebars.compile(source);

  const extendedData = {
    ...data,
    appUrl: "http://localhost:80",
    fileUrl: "https://email-service-henna.vercel.app"
  };

  // Inject template body
  const body = template(extendedData);

  // Wrap with a common heading layout
  return `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
      <!-- Heading -->
      <div style="background: #1ED760; padding: 20px; text-align: center; color: white;">
        <img src="https://email-service-henna.vercel.app/api/image-proxy?file=logo" alt="Harmoniq" style="max-height: 50px; display: block; margin: auto;"/>
      </div>

      <!-- Body -->
      <div style="padding: 0px; line-height: 1.5;">
        ${body}
      </div>

      <!-- Footer -->
      <div style="background: #f5f5f5; padding: 10px; text-align: center; font-size: 12px; color: #888;">
        &copy; ${new Date().getFullYear()} Harmoniq. All rights reserved.
      </div>
    </div>
  `;
}

/* // --- 3. Send email ---
export async function sendEmail(templateName, data, toEmail, subject) {
  const htmlBody = getTemplate(templateName, data);

  let mailOptions = {
    from: '"Harmoniq Team" <harmoniq.uom@gmail.com>',
    to: toEmail,
    subject: subject,
    html: htmlBody
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response);
  } catch (err) {
    console.error("❌ Error:", err);
  }
} */


// --- 3. Send email --- FOR HTTPS TO BYPASS RESTRICTIONS
export async function sendEmail(templateName, data, toEmail, subject) {
  const htmlBody = getTemplate(templateName, data);

  let mailOptions = {
    from: '"Harmoniq Team" <harmoniq.uom@gmail.com>',
    to: toEmail,
    subject: subject,
    html: htmlBody
  };

  try {
    const response = await fetch("https://email-service-henna.vercel.app/api/send-email", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json"
      },
      body: JSON.stringify(mailOptions),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || 'Failed to send email');
    }

    const result = await response.json();
    console.log("✅ Email sent:", result.response);
    return result;
    
  } catch (err) {
    console.error("❌ Error sending email:", err.message);
    throw err;
  }
}


export function sendEmailReleaseSong(list, data) {
  // Iterate over the list of recipient emails
  for (const email of list) {
    // Call the main sendEmail function for the current recipient
    try {
      sendEmail(
        "artist_release",
        data, 
        email, 
        `NEW ALBUM FROM ${data.artistName} IS OUT NOW!`
      );
    } catch (error) {
      // Log errors but continue the loop for other recipients
      console.error(`❌ Failed to send release email to ${email}:`, error);
    }
  }
  
  console.log(`✅ Finished processing album release emails for ${list.length} recipients.`);
}