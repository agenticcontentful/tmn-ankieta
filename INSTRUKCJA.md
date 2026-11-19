# Ankieta TMN: uruchomienie

## 1. Arkusz na wyniki (konto Google TMN, ok. 5 minut)

1. Zaloguj się na konto Google TMN i utwórz nowy Arkusz Google, np. „Ankieta odżywianie – wyniki”.
2. W arkuszu: **Rozszerzenia → Apps Script**.
3. Usuń przykładowy kod i wklej całą zawartość pliku `Code.gs`. Zapisz (ikona dyskietki).
4. Z listy funkcji u góry wybierz **setup** i kliknij **▶ Uruchom**. Google poprosi o uprawnienia: wybierz konto TMN → „Zaawansowane” → „Przejdź do projektu” → „Zezwól”. W arkuszu pojawi się zakładka „Odpowiedzi” z nagłówkami.
5. **Wdróż → Nowe wdrożenie** → typ: **Aplikacja internetowa**.
   - Wykonuj jako: **Ja**
   - Kto ma dostęp: **Każdy**
6. Kliknij **Wdróż** i skopiuj **adres URL aplikacji internetowej** (kończy się na `/exec`).
7. Ten adres wklej do pliku `app.js` w pierwszej linii: `const ENDPOINT = 'https://script.google.com/macros/s/.../exec';`

## 2. Tablet

1. Otwórz link do ankiety w Safari (iPad) albo Chrome (Android).
2. **Udostępnij → Dodaj do ekranu głównego**. Ankieta otwiera się wtedy jak aplikacja, bez pasków przeglądarki.
3. Żeby klient nie wyszedł z ankiety:
   - iPad: Ustawienia → Dostępność → **Dostęp z przewodnikiem** → włącz. W ankiecie kliknij 3× boczny przycisk, żeby zablokować ekran.
   - Android: Ustawienia → Zabezpieczenia → **Przypinanie aplikacji**.
4. Wyłącz automatyczną blokadę ekranu albo ustaw ją na dłużej.

## Jak to działa

- Jedno pytanie na ekran, na końcu podziękowanie i automatyczny powrót do startu po 8 sekundach (albo przycisk „Następna osoba”).
- Na końcu ankiety klient podaje imię i nazwisko, telefon i (opcjonalnie) e-mail oraz zaznacza zgodę na przetwarzanie danych. Osobna, dobrowolna zgoda dotyczy kontaktu w sprawie konsultacji dietetycznej: te osoby to leady. Ich wiersze w arkuszu są podświetlone na żółto, a w kolumnie „Kontakt w sprawie konsultacji” jest „Tak”.
- Arkusz zawiera dane osobowe: udostępniaj go tylko osobom, które dzwonią do leadów.
- Jeśli wifi zniknie, odpowiedzi czekają na tablecie i wyślą się same, gdy połączenie wróci (napis „Czeka na wysłanie: X” w lewym dolnym rogu).
- Bez wklejonego adresu z punktu 1.7 ankieta działa w trybie testowym i niczego nie zapisuje.
