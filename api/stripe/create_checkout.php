<?php
// Tworzy Stripe Checkout Session (bez Composer'a — czysty cURL)
header('Content-Type: application/json; charset=utf-8');
require __DIR__ . '/config.php';

$amount = isset($_POST['amount']) ? intval($_POST['amount']) : DEFAULT_UNIT_AMOUNT;
if ($amount < 100) { $amount = DEFAULT_UNIT_AMOUNT; }

$fields = [
  'mode' => 'payment',
  'success_url' => SUCCESS_URL . '?session_id={CHECKOUT_SESSION_ID}',
  'cancel_url'  => CANCEL_URL,
  // price_data zamiast price_id — żeby nie potrzebować tworzyć Price w panelu
  'line_items[0][price_data][currency]' => DEFAULT_CURRENCY,
  'line_items[0][price_data][product_data][name]' => PRODUCT_NAME,
  'line_items[0][price_data][unit_amount]' => $amount,
  'line_items[0][quantity]' => 1,
];

$ch = curl_init('https://api.stripe.com/v1/checkout/sessions');
curl_setopt_array($ch, [
  CURLOPT_POST => true,
  CURLOPT_POSTFIELDS => http_build_query($fields),
  CURLOPT_HTTPHEADER => [
    'Authorization: Bearer ' . STRIPE_SECRET_KEY,
    'Content-Type: application/x-www-form-urlencoded',
  ],
  CURLOPT_RETURNTRANSFER => true,
]);

$res = curl_exec($ch);
$http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
if ($res === false) {
  http_response_code(500);
  echo json_encode(['error' => 'cURL error']);
  exit;
}
curl_close($ch);
http_response_code($http);
echo $res;
?>
