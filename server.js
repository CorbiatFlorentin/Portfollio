import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

function envOrDefault(value, fallback) {
  return value && value.trim() !== "" ? value : fallback;
}

function requireEnv(value, name) {
  if (!value) {
    throw new Error(`Missing env var: ${name}`);
  }
}

app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ ok: false, error: "Missing fields" });
  }

  try {
    const smtpHost = envOrDefault(process.env.SMTP_HOST, "smtp.gmail.com");
    const smtpPort = Number(envOrDefault(process.env.SMTP_PORT, "465"));
    const smtpSecure = String(envOrDefault(process.env.SMTP_SECURE, "true")).toLowerCase() === "true";
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    requireEnv(smtpUser, "SMTP_USER");
    requireEnv(smtpPass, "SMTP_PASS");

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    const toAddress = envOrDefault(process.env.MAIL_TO, smtpUser);
    const fromAddress = envOrDefault(process.env.MAIL_FROM, smtpUser);

    await transporter.sendMail({
      from: fromAddress,
      to: toAddress,
      replyTo: email,
      subject: `Contact Portfolio - ${name}`,
      text: `Nom: ${name}\nEmail: ${email}\n\n${message}`
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: "Send failed" });
  }
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
