<?php
// ===== Stripe CONFIG (TEST) =====
define('STRIPE_PUBLISHABLE_KEY', 'pk_test_51RuyrLHUgwfawF70onO38nucjQOFX8q72lJ4J7nJiei5ssyqHB21u8OvE54CkaU47dax5DQKq7Qz2rFO5MEXq1j700eY2DxT3Y');
define('STRIPE_SECRET_KEY',      'sk_test_51RuyrLHUgwfawF70HMATCcPGFKoFAdHgm6tQieDC129WUJDaLbebfY6u1SCED7I3ktcgSXkCxZh344rAB89GsYzO00LKlzcUL0');
define('STRIPE_WEBHOOK_SECRET',  'whsec_B39kTm8gXz2Dob2t6dUMs4Yms6uco1lM'); // from Stripe Webhooks

// Kwota domyślna (grosze) i opis
define('DEFAULT_UNIT_AMOUNT', 4900); // 49,00 PLN
define('DEFAULT_CURRENCY', 'pln');
define('PRODUCT_NAME', 'Didim — zamówienie');

// Dokąd wracać po płatności
define('SUCCESS_URL', 'https://didim.pl/success.html');
define('CANCEL_URL',  'https://didim.pl/cancel.html');
?>
