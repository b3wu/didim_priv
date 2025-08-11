// netlify/functions/contact.js
const nodemailer = require('nodemailer');
exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: JSON.stringify({ ok: false, error: 'Method not allowed' }) };
  try {
    const { name, email, subject, message } = JSON.parse(event.body || '{}');
    if (!name || !email || !message) return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'Brak wymaganych pól.' }) };
    const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: process.env.SMTP_PORT === '465', auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
    const to = process.env.CONTACT_TO; if (!to) return { statusCode: 500, body: JSON.stringify({ ok: false, error: 'Brak CONTACT_TO' }) };
    const info = await transporter.sendMail({ from: `"Bewu3D" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`, to, subject: subject ? `[Zapytanie] ${subject}` : 'Zapytanie z formularza', text: `Imię: ${name}\nEmail: ${email}\n\n${message}`, replyTo: email });
    return { statusCode: 200, body: JSON.stringify({ ok: true, id: info.messageId }) };
  } catch (e) { console.error(e); return { statusCode: 500, body: JSON.stringify({ ok: false, error: 'Błąd serwera poczty.' }) }; }
};
