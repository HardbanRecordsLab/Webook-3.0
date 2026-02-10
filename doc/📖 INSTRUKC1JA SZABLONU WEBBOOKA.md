# 📖 INSTRUKCJA SZABLONU WEBBOOKA

**Przygotował:** Manus AI  
**Data:** Styczeń 2026  
**Wersja:** 1.0

---

## 🎯 WSTĘP

Szablon webbooka jest gotowym, funkcjonalnym wzorem, który możesz natychmiast dostosować do swoich treści. Zawiera wszystkie niezbędne elementy: nawigację, strony treści, multimedia, karty pracy, quizy i wiele więcej.

**Czas adaptacji:** 2-4 godziny (w zależności od liczby zmian)

---

## 📋 SZYBKI START

### Krok 1: Otwórz Plik

Pobierz plik `WEBBOOK_TEMPLATE.html` i otwórz go w edytorze tekstu (np. VS Code, Sublime Text) lub bezpośrednio w przeglądarce.

### Krok 2: Zastąp Placeholdery

Szukaj tekstu w nawiasach kwadratowych `[PLACEHOLDER]` i zastąp go swoimi treściami:

- `[TYTUŁ WEBBOOKA]` → Wpisz tytuł Twojego kursu
- `[PODTYTUŁ WEBBOOKA]` → Wpisz krótki opis
- `[LOGO/NAZWA WEBBOOKA]` → Wpisz nazwę lub logo
- `[LICZBA DNI/TYGODNI]` → Wpisz czas trwania kursu
- `[LICZBA]` → Wpisz liczby (modułów, lekcji, itp.)

### Krok 3: Dodaj Treści

Zastąp placeholdery treści rzeczywistymi treściami:

- `[GŁÓWNY CEL KURSU]` → Opisz główny cel
- `[GŁÓWNE UMIEJĘTNOŚCI]` → Wymień umiejętności
- `[TREŚĆ WPROWADZENIA]` → Wpisz wprowadzenie
- `[TREŚĆ LEKCJI]` → Wpisz treść lekcji

### Krok 4: Dodaj Multimedia

Zastąp linki do mediów rzeczywistymi linkami:

- `[PLACEHOLDER_IMAGE_URL]` → Wpisz URL zdjęcia
- `[PLACEHOLDER_AUDIO_URL]` → Wpisz URL pliku audio
- `[VIDEO_ID]` → Wpisz ID wideo YouTube

### Krok 5: Testuj w Przeglądarce

Otwórz plik HTML w przeglądarce i sprawdź, czy wszystko działa poprawnie.

---

## 🔍 SZCZEGÓŁOWY PRZEWODNIK PO PLACEHOLDERACH

### Sekcja HEAD (Metadane)

```html
<title>[TYTUŁ WEBBOOKA] - Interaktywny Kurs Online</title>
<meta name="description" content="[KRÓTKI OPIS WEBBOOKA - max 160 znaków]">
<meta name="author" content="[AUTOR/TWOJA NAZWA]">
```

**Co zmienić:**
- `[TYTUŁ WEBBOOKA]` → Np. "Medytacja dla Początkujących"
- `[KRÓTKI OPIS WEBBOOKA]` → Np. "Naucz się medytacji w 7 dni. Kurs dla początkujących z nagraniami audio i ćwiczeniami."
- `[AUTOR/TWOJA NAZWA]` → Np. "Jan Kowalski"

### Sekcja HEADER

```html
<a href="#" class="logo">[LOGO/NAZWA WEBBOOKA]</a>
```

**Co zmienić:**
- `[LOGO/NAZWA WEBBOOKA]` → Np. "🧘 Medytacja Studio"

### Sekcja SIDEBAR (Nawigacja)

```html
<div class="sidebar-section">
    <div class="sidebar-title">Moduł 1: Wprowadzenie</div>
    <a href="#" class="sidebar-link active" onclick="showPage('page-1-1')">1.1 Witaj w Webbooku</a>
    <a href="#" class="sidebar-link" onclick="showPage('page-1-2')">1.2 Jak Używać Tego Kursu</a>
    <a href="#" class="sidebar-link" onclick="showPage('page-1-3')">1.3 Twoje Cele</a>
</div>
```

**Co zmienić:**
- Nazwy modułów (np. "Moduł 1: Podstawy Medytacji")
- Nazwy lekcji (np. "1.1 Co to jest medytacja?")
- Liczba modułów i lekcji (dodaj/usuń sekcje i linki)

**Ważne:** Każdy link musi mieć unikatowy `onclick="showPage('page-X-Y')"` i odpowiadającą mu stronę w sekcji MAIN.

### Sekcja MAIN (Treść)

#### Strona 1.1 - Witaj w Webbooku

```html
<div class="page active" id="page-1-1">
    <div class="page-header">
        <h1>Witaj w Webbooku!</h1>
        <p class="subtitle">[PODTYTUŁ WEBBOOKA]</p>
    </div>

    <div class="content-block highlight">
        <p>Gratulacje! Jesteś tutaj, co oznacza, że jesteś gotowy do [GŁÓWNY CEL KURSU]. W ciągu [LICZBA DNI/TYGODNI] nauczysz się [GŁÓWNE UMIEJĘTNOŚCI].</p>
    </div>
    ...
</div>
```

**Co zmienić:**
- `[PODTYTUŁ WEBBOOKA]` → Np. "Naucz się medytacji w 7 dni"
- `[GŁÓWNY CEL KURSU]` → Np. "zmniejszenia stresu i poprawy snu"
- `[LICZBA DNI/TYGODNI]` → Np. "7 dni"
- `[GŁÓWNE UMIEJĘTNOŚCI]` → Np. "podstawowych technik medytacji, oddychania i relaksacji"

#### Strona 2.1 - Lekcja 1

```html
<div class="page" id="page-2-1">
    <div class="page-header">
        <h1>Lekcja 1: Podstawy</h1>
        <p class="subtitle">[PODTYTUŁ LEKCJI]</p>
    </div>

    <div class="content-block highlight">
        <p><strong>Główna Idea:</strong> [GŁÓWNA IDEA LEKCJI - 1-2 zdania]</p>
    </div>

    <h2>Wprowadzenie</h2>
    <p>[TREŚĆ WPROWADZENIA - 2-3 akapity wyjaśniające kontekst lekcji]</p>

    <div class="media-container">
        <img src="[PLACEHOLDER_IMAGE_URL]" alt="Ilustracja do lekcji 1">
        <p class="media-caption">[OPIS ZDJĘCIA]</p>
    </div>
    ...
</div>
```

**Co zmienić:**
- `[PODTYTUŁ LEKCJI]` → Np. "Czym jest medytacja?"
- `[GŁÓWNA IDEA LEKCJI]` → Np. "Medytacja to praktyka skupienia uwagi na teraźniejszości."
- `[TREŚĆ WPROWADZENIA]` → Wpisz 2-3 akapity wprowadzenia
- `[PLACEHOLDER_IMAGE_URL]` → Np. "https://unsplash.com/photos/meditation.jpg"
- `[OPIS ZDJĘCIA]` → Np. "Kobieta medytująca w spokojnym otoczeniu"

#### Nagranie Audio

```html
<div class="audio-player">
    <div class="audio-player-title">🎧 Słuchaj: [TYTUŁ NAGRANIA]</div>
    <audio controls>
        <source src="[PLACEHOLDER_AUDIO_URL]" type="audio/mpeg">
        Twoja przeglądarka nie obsługuje odtwarzania audio.
    </audio>
</div>
```

**Co zmienić:**
- `[TYTUŁ NAGRANIA]` → Np. "Medytacja na dobry sen (10 minut)"
- `[PLACEHOLDER_AUDIO_URL]` → URL do pliku MP3

#### Wideo

```html
<div class="video-container">
    <iframe src="https://www.youtube.com/embed/[VIDEO_ID]" allowfullscreen></iframe>
</div>
```

**Co zmienić:**
- `[VIDEO_ID]` → ID wideo YouTube (np. "dQw4w9WgXcQ")

#### Karty Pracy

```html
<div class="worksheet">
    <div class="worksheet-title">📋 Karta Pracy: Moje Cele</div>

    <div class="form-group">
        <label>[PYTANIE 1]</label>
        <textarea placeholder="Wpisz swoją odpowiedź..."></textarea>
    </div>

    <div class="form-group">
        <label>[PYTANIE 2]</label>
        <textarea placeholder="Wpisz swoją odpowiedź..."></textarea>
    </div>

    <button class="btn btn-save" onclick="saveWorksheet()">💾 Zapisz Kartę Pracy</button>
</div>
```

**Co zmienić:**
- `[PYTANIE 1]`, `[PYTANIE 2]` → Wpisz rzeczywiste pytania
- Dodaj więcej `<div class="form-group">` jeśli potrzebujesz więcej pól

#### Quizy

```html
<div class="quiz">
    <div class="quiz-title">❓ Sprawdź Swoją Wiedzę</div>

    <div class="quiz-question">
        <div class="quiz-question-text">1. [PYTANIE 1]</div>
        <div class="quiz-options">
            <label class="quiz-option">
                <input type="radio" name="q1" value="a"> [ODPOWIEDŹ A]
            </label>
            <label class="quiz-option">
                <input type="radio" name="q1" value="b"> [ODPOWIEDŹ B]
            </label>
            <label class="quiz-option">
                <input type="radio" name="q1" value="c"> [ODPOWIEDŹ C]
            </label>
        </div>
    </div>
    ...
</div>
```

**Co zmienić:**
- `[PYTANIE 1]` → Wpisz pytanie
- `[ODPOWIEDŹ A]`, `[ODPOWIEDŹ B]`, `[ODPOWIEDŹ C]` → Wpisz odpowiedzi
- Dodaj więcej pytań (kopiując sekcję `<div class="quiz-question">`)

### Sekcja FOOTER

```html
<div class="footer-content">
    <div class="footer-links">
        <a href="#">O Kursie</a>
        <a href="#">Kontakt</a>
        <a href="#">Polityka Prywatności</a>
        <a href="#">Warunki Użytkowania</a>
    </div>
    <p>&copy; 2026 [NAZWA AUTORA]. Wszystkie prawa zastrzeżone.</p>
    <p>Webbook stworzony przez <strong>HardbanRecords Lab</strong></p>
</div>
```

**Co zmienić:**
- `[NAZWA AUTORA]` → Twoja nazwa

---

## 🎨 DOSTOSOWANIE KOLORÓW

Kolory są zdefiniowane w sekcji `:root` w CSS:

```css
:root {
    --primary-color: #2563eb;        /* Niebieski */
    --secondary-color: #1e40af;      /* Ciemny niebieski */
    --accent-color: #f59e0b;         /* Pomarańczowy */
    --text-dark: #1f2937;            /* Ciemny tekst */
    --text-light: #6b7280;           /* Jasny tekst */
    --bg-light: #f9fafb;             /* Jasne tło */
    --bg-white: #ffffff;             /* Białe tło */
    --border-color: #e5e7eb;         /* Kolor obramowania */
    --success-color: #10b981;        /* Zielony (sukces) */
    --warning-color: #f59e0b;        /* Pomarańczowy (ostrzeżenie) */
}
```

**Jak zmienić kolory:**
1. Otwórz plik HTML w edytorze
2. Znajdź sekcję `:root`
3. Zmień wartości kolorów (np. `#2563eb` na `#ff0000` dla czerwonego)

**Popularne kolory:**
- Niebieski: `#2563eb`
- Zielony: `#10b981`
- Pomarańczowy: `#f59e0b`
- Różowy: `#ec4899`
- Fioletowy: `#8b5cf6`
- Czarny: `#1f2937`

---

## 📱 RESPONSYWNOŚĆ

Szablon jest w pełni responsywny i działa na:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Smartfon (< 768px)

Na urządzeniach mobilnych:
- Sidebar przesuwany jest na bok
- Menu jest dostępne poprzez przycisk "☰ Menu"
- Wszystkie elementy skalują się automatycznie

---

## 🔧 ZAAWANSOWANE DOSTOSOWANIA

### Dodawanie Nowych Stron

Aby dodać nową stronę:

1. **Dodaj link w sidebar:**
```html
<a href="#" class="sidebar-link" onclick="showPage('page-X-Y')">X.Y Nazwa Lekcji</a>
```

2. **Dodaj stronę w sekcji MAIN:**
```html
<div class="page" id="page-X-Y">
    <div class="page-header">
        <h1>Nazwa Lekcji</h1>
    </div>
    <!-- Treść strony -->
</div>
```

### Dodawanie Nowych Elementów

#### Notatka (Note)
```html
<div class="note">
    <div class="note-title">💡 Wskazówka</div>
    <p>Treść notatki</p>
</div>
```

#### Blok Treści (Content Block)
```html
<div class="content-block">
    <p>Treść bloku</p>
</div>
```

#### Blok Treści z Wyróżnieniem
```html
<div class="content-block highlight">
    <p>Ważna treść</p>
</div>
```

#### Przycisk
```html
<button class="btn btn-primary" onclick="showPage('page-X-Y')">Tekst Przycisku →</button>
```

---

## 💾 ZAPISYWANIE I PUBLIKACJA

### Zapisywanie Lokalnie

1. Otwórz plik HTML w edytorze
2. Dokonaj zmian
3. Zapisz plik (Ctrl+S lub Cmd+S)
4. Otwórz w przeglądarce (F5 lub Cmd+R, aby odświeżyć)

### Publikacja Online

Aby opublikować webbook online:

**Opcja 1: Vercel (Rekomendowane)**
1. Utwórz konto na [Vercel.com](https://vercel.com)
2. Zainstaluj Vercel CLI: `npm install -g vercel`
3. Przejdź do folderu z plikiem HTML
4. Uruchom: `vercel`
5. Postępuj zgodnie z instrukcjami

**Opcja 2: Netlify**
1. Utwórz konto na [Netlify.com](https://netlify.com)
2. Przeciągnij plik HTML na stronę Netlify
3. Gotowe! Webbook jest dostępny online

**Opcja 3: Własny Hosting**
1. Zaloguj się do panelu hostingu
2. Przesyłaj plik HTML via FTP
3. Otwórz w przeglądarce

---

## ✅ CHECKLIST PRZED PUBLIKACJĄ

Przed opublikowaniem webbooka, upewnij się, że:

- [ ] Wszystkie placeholdery `[...]` zostały zastąpione
- [ ] Wszystkie linki do mediów (zdjęcia, audio, wideo) działają
- [ ] Wszystkie linki do stron działają
- [ ] Testowałeś webbook na desktop, tablet i smartfonie
- [ ] Sprawdziłeś ortografię i gramatykę
- [ ] Dodałeś swoje logo/branding
- [ ] Dostosowałeś kolory do Twojej marki
- [ ] Przetestowałeś wszystkie przyciski i formularze
- [ ] Sprawdziłeś, czy nagrania audio działają
- [ ] Sprawdziłeś, czy wideo YouTube się ładuje

---

## 🆘 ROZWIĄZYWANIE PROBLEMÓW

### Problem: Strony się nie przełączają

**Rozwiązanie:** Sprawdź, czy ID strony w `onclick="showPage('page-X-Y')"` odpowiada ID w `<div class="page" id="page-X-Y">`

### Problem: Zdjęcia się nie ładują

**Rozwiązanie:** Sprawdź, czy URL zdjęcia jest prawidłowy. Upewnij się, że zdjęcie jest dostępne publicznie.

### Problem: Audio się nie odtwarza

**Rozwiązanie:** Sprawdź, czy URL pliku audio jest prawidłowy i czy plik jest w formacie MP3.

### Problem: Wideo YouTube się nie ładuje

**Rozwiązanie:** Sprawdź, czy ID wideo jest prawidłowy. ID to część URL po `v=` (np. `dQw4w9WgXcQ`)

### Problem: Sidebar nie działa na mobilnym

**Rozwiązanie:** To normalne. Sidebar jest dostępny poprzez przycisk "☰ Menu" na urządzeniach mobilnych.

---

## 📞 WSPARCIE

Jeśli masz pytania lub problemy:

**Email:** hardbanrecordslab.pl@gmail.com  
**Telefon:** +48 725 663 741  
**Website:** [Twoja domena]

---

**Dokument przygotowany przez:** Manus AI  
**Data:** Styczeń 2026  
**Wersja:** 1.0  
**Status:** Gotowy do użytku
