# Bewu3D – MVP v8 (3MF + koszyk agregowany)

## Lokalne uruchomienie
```bash
npm install
npm run dev
# http://localhost:5173
```

## Netlify (deploy)
- Build: `npm run build`
- Publish: `dist`
- Functions: `netlify/functions`
- ENV: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `CONTACT_TO`

## Funkcje
- Wgrywanie **STL i 3MF** (Bambu Studio projects) + podgląd 3D.
- Wycena wg wagi (150 PLN/kg), dopłata AMS, minimalna 30 PLN **na poziomie koszyka**.
- „Wyślij koszyk do wyceny” – mail z podsumowaniem, miniaturami, załącznikami (STL/3MF ≤ 5 MB/szt.).
- Kontakt i wycena przez Netlify Functions (nodemailer).
- Uwaga: 3MF nie zawiera faktycznego krojenia – wycena jest orientacyjna.
