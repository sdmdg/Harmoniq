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
    appUrl: "http://localhost:5173",
  };

  // Inject template body
  const body = template(extendedData);

  // Wrap with a common heading layout
  return `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
      <!-- Heading -->
      <div style="background: #1ED760; padding: 20px; text-align: center; color: white;">
        <img src="https://i.postimg.cc/qMJxjfsd/logo.png" alt="Harmoniq" style="max-height: 50px; display: block; margin: auto;"/>
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

// --- 3. Send email ---
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
}