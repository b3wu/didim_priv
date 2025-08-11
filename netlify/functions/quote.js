// netlify/functions/quote.js
const nodemailer = require('nodemailer');
exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: JSON.stringify({ ok: false, error: 'Method not allowed' }) };
  try {
    const body = JSON.parse(event.body || '{}'); const { name, email, phone, notes, cart, attachments = [] } = body || {};
    if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'Brak pozycji w koszyku.' }) };
    const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: process.env.SMTP_PORT === '465', auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
    const to = process.env.CONTACT_TO; if (!to) return { statusCode: 500, body: JSON.stringify({ ok: false, error: 'Brak CONTACT_TO w konfiguracji.' }) };
    const header = [`Imię: ${name || '-'}`,`E-mail: ${email || '-'}`,`Telefon: ${phone || '-'}`,'',`Pozycje:`];
    const lines = [];
    cart.items.forEach((it, idx) => { if (it.type === 'product') { lines.push(` ${idx+1}. Produkt: ${it.name} ×${it.qty}`); lines.push(`    cena/szt.: ${it.pricePerPiece} PLN  razem: ${it.total} PLN`); } else { lines.push(` ${idx+1}. ${it.type.toUpperCase()}: ${it.filename} ×${it.copies}`); lines.push(`    materiał: ${it.material}  kolory(AMS): ${it.colors}`); lines.push(`    waga: ${it.weightG} g  cena/szt.: ${it.pricePerPiece} PLN  razem: ${it.total} PLN`); } });
    lines.push(''); lines.push(`Podsumowanie: sub‑total ${Number(cart.subTotal).toFixed(2)} PLN`); lines.push(`Opłata minimalna: ${Number(cart.minSurcharge).toFixed(2)} PLN`); lines.push(`RAZEM: ${Number(cart.total).toFixed(2)} PLN`); lines.push(''); lines.push(`Uwagi: ${notes || '-'}`);
    const mailOptions = { from: `"Bewu3D" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`, to, subject: `[Wycena] ${cart.items.length} pozycji (razem ${Number(cart.total).toFixed(2)} PLN)`, text: header.concat(lines).join('\n'),
      attachments: attachments.slice(0, 6).map((a, i) => ({ filename: a.filename || `model-${i+1}.stl`, content: Buffer.from(a.contentBase64, 'base64'), contentType: a.mimeType || 'application/octet-stream' })) };
    const info = await transporter.sendMail(mailOptions);
    return { statusCode: 200, body: JSON.stringify({ ok: true, id: info.messageId }) };
  } catch (e) { console.error(e); return { statusCode: 500, body: JSON.stringify({ ok: false, error: 'Błąd wysyłki.' }) }; }
};
