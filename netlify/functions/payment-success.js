const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { getClient } = require('./lib/supabase');
exports.handler = async (event) => {
  const sig = event.headers['stripe-signature'];
  let data;
  try { const whSec = process.env.STRIPE_WEBHOOK_SECRET; if(!whSec) throw new Error('Missing STRIPE_WEBHOOK_SECRET'); data = stripe.webhooks.constructEvent(event.body, sig, whSec); }
  catch (err) { console.error('Webhook signature verification failed:', err.message); return { statusCode: 400, body: `Webhook Error: ${err.message}` }; }
  try { if (data.type === 'checkout.session.completed') { const session = data.data.object; const supabase = getClient(); await supabase.from('orders').update({ payment_status: 'paid' }).eq('stripe_session_id', session.id); } return { statusCode: 200, body: 'ok' }; }
  catch (e) { console.error(e); return { statusCode: 500, body: 'Server error' }; }
};