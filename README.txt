DIDIM — wersja LITE (placeholder images)
=======================================

To jest lekki ZIP z pełnym kodem strony i malutkimi obrazkami-zaślepkami, aby
zmieścić się w limicie transferu. Po rozpakowaniu:

1) Wklej swoje **prawdziwe zdjęcia** do:
   - assets/img/brand/logo.png
   - assets/img/brand/hero.jpg
   - assets/img/menu/loaded-fries-cheese.jpg
   - assets/img/menu/ramen-classic.jpg
   - assets/img/menu/loaded-fries-chili.jpg
   - assets/img/menu/gyoza.jpg
   - assets/img/menu/pizza-crudo.jpg
   - (opcjonalnie) assets/img/photos/ph_1.jpg ... ph_6.jpg

   UWAGA: zachowaj **te same nazwy plików** — wtedy nic nie trzeba zmieniać w kodzie.

2) Jeśli używasz Stripe + Supabase (Netlify):
   - Ustaw zmienne środowiskowe: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
   - Webhook Stripe -> /.netlify/functions/payment-success

3) Deploy na Netlify lub GitHub Pages (dla GitHub Pages usuń folder `netlify/` i wystarczy sam front).

Menu (kategorie, nazwy i ceny) jest wpisane w assets/js/menu.js.
Kolorystyka jest czarno-biała (assets/css/styles.css).