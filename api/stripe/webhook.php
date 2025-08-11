<?php
// Weryfikacja webhooka (HMAC SHA256) — bez biblioteki Stripe
require __DIR__ . '/config.php';

$payload = file_get_contents('php://input');
$sigHeader = $_SERVER['HTTP_STRIPE_SIGNATURE'] ?? '';

if (!STRIPE_WEBHOOK_SECRET) { http_response_code(500); echo 'Missing webhook secret'; exit; }

// Parse Stripe-Signature header
$parts = [];
foreach (explode(',', $sigHeader) as $kv) {
  $kv = trim($kv);
  if (strpos($kv, '=') !== false) {
    list($k,$v) = explode('=', $kv, 2);
    $parts[$k] = $v;
  }
}
if (!isset($parts['t']) || !isset($parts['v1'])) { http_response_code(400); echo 'Bad sig header'; exit; }

$timestamp = $parts['t'];
$signedPayload = $timestamp . '.' . $payload;
$computed = hash_hmac('sha256', $signedPayload, STRIPE_WEBHOOK_SECRET);

function timingSafeEq($a, $b) {
  if (strlen($a) !== strlen($b)) return false;
  $res = 0;
  for ($i=0; $i<strlen($a); $i++) { $res |= ord($a[$i]) ^ ord($b[$i]); }
  return $res === 0;
}

if (!timingSafeEq($computed, $parts['v1'])) {
  http_response_code(400); echo 'Bad signature'; exit;
}

$event = json_decode($payload, false);
if (!$event) { http_response_code(400); echo 'Bad JSON'; exit; }

if ($event->type === 'checkout.session.completed') {
  $session = $event->data->object;
  // LOG — później zastąpimy to zapisem do bazy
  @file_put_contents(__DIR__ . '/paid.log',
    date('c') . ' PAID ' . ($session->id ?? '') . ' ' . ($session->amount_total ?? '') . PHP_EOL,
    FILE_APPEND
  );
}

http_response_code(200);
echo 'ok';
?>
