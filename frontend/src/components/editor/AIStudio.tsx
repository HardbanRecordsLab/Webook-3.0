// ═══════════════════════════════════════════════════════════════════
// WEBOOK STUDIO 4.0 — AI STUDIO v2
// 35+ narzędzi w 7 kategoriach, 6 zakładek funkcjonalnych
// ═══════════════════════════════════════════════════════════════════
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, Send, Loader2, Plus, Globe, Search, Wand2,
  X, ChevronRight, Brain, Zap, FileText, Palette,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'
import type { Block } from '../../lib/blocks'
import { createBlock } from '../../lib/blocks'

// ─────────────────────────────────────────────────────────────────
//  35 NARZĘDZI — 7 kategorii po 5
// -----------------------------------------------------------------
const ALL_TOOLS = [

  // ── 🎓 NAUKA (8) ─────────────────────────────────────────────
  { id: 'quiz_multi', cat: '🎓 Nauka', icon: '❓', label: 'Quiz AI',
    desc: '8 pytań wielokrotnego wyboru z wyjaśnieniami i wynikiem',
    prompt: 'Stwórz interaktywny quiz 8 pytań wielokrotnego wyboru o: {topic}. Każde pytanie ma 4 opcje, jedna poprawna, po kliknięciu wyjaśnienie. Animacja kolorowa. Wynik końcowy z % poprawnych. Ciemny motyw #060E1C, akcent niebieski #1E6FDB, złoty #F59E0B.' },

  { id: 'flashcards', cat: '🎓 Nauka', icon: '🃏', label: 'Fiszki 3D',
    desc: 'Talia fiszek z animacją flip 3D, tryb nauki i powtórek',
    prompt: 'Stwórz interaktywną talię 12 fiszek z animacją CSS flip 3D o: {topic}. Przód: pytanie/termin. Tył: pełna odpowiedź z przykładem. Przyciski Wiem/Nie wiem, pasek postępu, licznik. Tryb losowy. Ciemny motyw.' },

  { id: 'true_false', cat: '🎓 Nauka', icon: '✅', label: 'Prawda/Fałsz',
    desc: '10 twierdzeń z animowanym feedbackiem i wyjaśnieniami',
    prompt: 'Zbuduj grę 10 pytań prawda/fałsz z wyjaśnieniami, temat: {topic}. Przyciski Prawda/Fałsz. Animacja: zielony+✓ = prawda, czerwony+✗ = fałsz. Licznik punktów. Podsumowanie wyników. Ciemny motyw.' },

  { id: 'fill_blank', cat: '🎓 Nauka', icon: '✏️', label: 'Uzupełnij luki',
    desc: 'Zdania z inputami do uzupełnienia + podpowiedzi',
    prompt: 'Ćwiczenie uzupełniania luk: 6 zdań edukacyjnych z 1-2 inputami każde (brakujące słowa). Temat: {topic}. Przycisk sprawdź z kolorowym feedbackiem, podpowiedź po 3 próbach. Ciemny motyw.' },

  { id: 'matching', cat: '🎓 Nauka', icon: '🔗', label: 'Dopasuj pary',
    desc: 'Klikaj pojęcia i definicje, twórz połączenia',
    prompt: 'Gra dopasowania par: 8 par termin↔definicja, temat: {topic}. 2 kolumny kart, kliknij kartę po lewej i odpowiadającą po prawej. Animacja dopasowania, licznik prób, wynik końcowy. Ciemny motyw.' },

  { id: 'speed_quiz', cat: '🎓 Nauka', icon: '⚡', label: 'Speed Quiz',
    desc: 'Quiz na 60 sekund — timer, combo, ranking',
    prompt: 'Speed Quiz z timerem: 10 pytań na 60 sekund, temat: {topic}. Animowany timer odliczający w dół. Combo za serię poprawnych. Każda sekunda = -1 pkt z 100. Efekty wizualne, animacja końca. Ciemny motyw.' },

  { id: 'word_scramble', cat: '🎓 Nauka', icon: '🔤', label: 'Anagram',
    desc: 'Klikaj litery by ułożyć poprawne słowo kluczowe',
    prompt: 'Gra anagramów: 8 terminów z tematu {topic} z pomieszanymi literami. Klikaj litery by ułożyć słowo. Podpowiedź po 3 próbach. Animacje, licznik punktów. Ciemny motyw.' },

  { id: 'sorting', cat: '🎓 Nauka', icon: '🔀', label: 'Sortowanie',
    desc: 'Ułóż elementy w poprawnej kolejności kliknięciami',
    prompt: 'Mini gra kolejności: 6 elementów do ułożenia w porządku chronologicznym/logicznym dot: {topic}. Kliknij element by go wybrać, kliknij slot by umieścić. Sprawdź kolejność z animacją. Ciemny motyw.' },

  // ── 💰 KALKULATORY (7) ────────────────────────────────────────
  { id: 'roi', cat: '💰 Kalkulatory', icon: '📊', label: 'Kalkulator ROI',
    desc: 'Inwestycja, przychód, koszty → ROI%, zysk, break-even',
    prompt: 'Kalkulator ROI: pola inwestycja (zł), przychód (zł), koszty operacyjne (zł). Oblicza natychmiast: ROI%, zysk netto, break-even w miesiącach. Animowany wskaźnik. Ciemny motyw #060E1C, akcent #1E6FDB.' },

  { id: 'bmi', cat: '💰 Kalkulatory', icon: '⚖️', label: 'Kalkulator BMI',
    desc: 'Waga + wzrost → BMI z wizualnym wskaźnikiem kategorii',
    prompt: 'Kalkulator BMI: waga (kg) + wzrost (cm). Opcja kg/lbs, cm/ft. Wynik: wartość BMI, kategoria (niedowaga/norma/nadwaga/otyłość), kolorowy pasek. Animacja. Ciemny motyw.' },

  { id: 'loan', cat: '💰 Kalkulatory', icon: '🏦', label: 'Kalkulator kredytu',
    desc: 'Miesięczna rata, całkowity koszt, proporcja odsetki/kapitał',
    prompt: 'Kalkulator kredytu: kwota (zł), oprocentowanie (%), liczba lat (suwak). Oblicza: rata miesięczna, całkowity koszt, łączne odsetki. Prostokątny wykres proporcji kapitał/odsetki. Ciemny motyw.' },

  { id: 'budget', cat: '💰 Kalkulatory', icon: '💸', label: 'Planer budżetu',
    desc: 'Kategorie wydatków z suwakami procentowymi i alertami',
    prompt: 'Planer budżetu miesięcznego: pole dochód netto. 8 kategorii (mieszkanie, jedzenie, transport, zdrowie, rozrywka, oszczędności, ubrania, inne) z suwakami %. Sumuje automatycznie, alert przy >100%. Ciemny motyw.' },

  { id: 'tax', cat: '💰 Kalkulatory', icon: '🧾', label: 'Kalkulator VAT',
    desc: 'Netto↔brutto, różne stawki VAT, tryb B2B/UoP',
    prompt: 'Kalkulator podatkowy PL: tryby netto↔brutto VAT (23%, 8%, 5%, 0%). Przelicza natychmiast. Zakładka B2B vs UoP — porównanie netto po podatkach. Tabela wyników. Ciemny motyw.' },

  { id: 'converter', cat: '💰 Kalkulatory', icon: '🔄', label: 'Mega przelicznik',
    desc: 'Długość, waga, temperatura, objętość, prędkość — 5 kategorii',
    prompt: 'Przelicznik jednostek 5 kategorii: długość, waga, temperatura, objętość, prędkość. Zakładki na górze. 2 selecty jednostek + pole liczbowe. Przelicza realtime. Ciemny motyw.' },

  { id: 'score_calc', cat: '💰 Kalkulatory', icon: '🎯', label: 'Kalkulator ważony',
    desc: 'Ważony kalkulator wyników — 6 kryteriów z wagami',
    prompt: 'Kalkulator wyników z wagami: 6 kryteriów (edytowalne nazwy), każde z suwakiem wagi (0-100%) i oceny (0-10). Oblicza wynik ważony, procentowy, gwiazdki. Ciemny motyw.' },

  { id: 'time_calc', cat: '💰 Kalkulatory', icon: '⏱️', label: 'Kalkulator czasu',
    desc: 'Dodawanie/odejmowanie czasu, konwersja stref czasowych',
    prompt: 'Kalkulator czasu: dodaj/odejmuj godziny/minuty, oblicz różnicę między datami, konwertuj strefy czasowe (UTC, CET, EST, PST). Czytelny interfejs. Ciemny motyw.' },

  // ── ⚡ PRODUKTYWNOŚĆ (6) ─────────────────────────────────────
  { id: 'pomodoro', cat: '⚡ Produktywność', icon: '⏱️', label: 'Pomodoro',
    desc: '25/5 min timer z animowanym kółkiem i dźwiękiem Web Audio',
    prompt: 'Timer Pomodoro: 25 min praca + 5 min przerwa. Animowany okrąg SVG odliczający z gradientem. Dźwięk Web Audio API na koniec (beep). Licznik sesji, po 4 długa przerwa 15 min. Start/Pauza/Reset. Ciemny motyw.' },

  { id: 'habits', cat: '⚡ Produktywność', icon: '📅', label: 'Habit Tracker',
    desc: 'Tygodniowy tracker 5 nawyków ze streak i postępem',
    prompt: 'Habit Tracker tygodniowy: 5 edytowalnych nawyków, dni Pn-Nd, checkboxy. Streak counter dla każdego nawyku. Pasek postępu tygodnia. Animacja przy oznaczaniu. Kolory per nawyk. Ciemny motyw.' },

  { id: 'decision', cat: '⚡ Produktywność', icon: '🎯', label: 'Decision Matrix',
    desc: 'Macierz decyzyjna z wagami kryteriów i ranking opcji',
    prompt: 'Decision Matrix: 4 opcje × 5 kryteriów (edytowalne) z wagami. Tabela interaktywna z ocenami 1-10. Oblicza wynik ważony każdej opcji. Podświetla zwycięzcę. Ciemny motyw.' },

  { id: 'goal_tracker', cat: '⚡ Produktywność', icon: '🏆', label: 'Goal Tracker',
    desc: 'Śledzenie 4 celów z postępem, datami i statusem',
    prompt: 'Goal Tracker: 4 cele z opisem, datą docelową i wartościami (obecna/docelowa). Pasek postępu, countdown do terminu. Status: w toku/ukończony/zagrożony (kolor). Ciemny motyw.' },

  { id: 'kanban', cat: '⚡ Produktywność', icon: '📋', label: 'Mini Kanban',
    desc: '3 kolumny drag-and-drop z kartami i priorytetami',
    prompt: 'Mini Kanban: 3 kolumny Do zrobienia/W toku/Gotowe. Dodawanie kart (tytuł + priorytet). Drag-and-drop między kolumnami przez JS mousedown/mousemove. Kolorowe priorytety. Licznik kart. Ciemny motyw.' },

  { id: 'notes_sticky', cat: '⚡ Produktywność', icon: '📌', label: 'Sticky Notes',
    desc: 'Kolorowe karteczki z przeciąganiem po tablicy',
    prompt: 'Tablica sticky notes: dodawaj kolorowe karteczki (4 kolory) z tekstem, przeciągaj po tablicy (JS drag), usuń X. Wygląd tablicy korkowej — ciemne tło, kolorowe karteczki z cieniem.' },

  { id: 'checklist_smart', cat: '⚡ Produktywność', icon: '✅', label: 'Smart Checklist',
    desc: 'Checklista z postępem, konfetti i eksportem',
    prompt: 'Smart Checklist: 8 kroków (edytowalne) z opisem i checkboxami. Pasek postępu animowany. Confetti JavaScript po ukończeniu wszystkich. Przycisk "Resetuj". Ciemny motyw.' },

  // ── 📊 WIZUALIZACJE (6) ──────────────────────────────────────
  { id: 'chart_bar', cat: '📊 Wizualizacje', icon: '📈', label: 'Wykres słupkowy',
    desc: 'Animowany wykres z 8 słupkami i tooltipami',
    prompt: 'Animowany wykres słupkowy SVG: 6-8 słupków, temat: {topic}. Animacja wzrostu przy załadowaniu. Tooltip z wartością na hover. Gradient kolorów. Edytowalne wartości przez kliknięcie. Ciemny motyw.' },

  { id: 'timeline_vis', cat: '📊 Wizualizacje', icon: '🕐', label: 'Oś czasu',
    desc: 'Pionowa oś 6 etapów — kliknij by rozwinąć detale',
    prompt: 'Interaktywna oś czasu pionowa: 6 etapów o: {topic}. Ikona, data, tytuł, opis przy każdym. Kliknięcie etapu rozwija szczegóły z animacją slide. Linia łącząca. Ciemny motyw, niebieski akcent.' },

  { id: 'swot', cat: '📊 Wizualizacje', icon: '🔲', label: 'Macierz SWOT',
    desc: 'SWOT z 4 ćwiartkami, edytowalnymi punktami',
    prompt: 'Interaktywna macierz SWOT dla: {topic}. 4 ćwiartki: Mocne strony (zielona), Słabości (czerwona), Szanse (niebieska), Zagrożenia (pomarańczowa). Każda z 3-4 edytowalnymi punktami. Dodaj/usuń punkt. Ciemny motyw.' },

  { id: 'comparison_vis', cat: '📊 Wizualizacje', icon: '⚖️', label: 'Porównanie',
    desc: '2 opcje side-by-side z zaletami, ocenami i rekomendacją',
    prompt: 'Karta porównawcza: 2 opcje side-by-side dla: {topic}. Każda: ikona, tytuł, 5 cech (✓/✗). Ocena gwiazdkowa. Rekomendacja podświetlona. Animacja hover. Ciemny motyw, kolory niebieski/pomarańczowy.' },

  { id: 'infographic', cat: '📊 Wizualizacje', icon: '🎨', label: 'Infografika',
    desc: '5 faktów z ikonami i animacjami wejścia sekwencyjnego',
    prompt: 'Infografika 5 kluczowych faktów/statystyk o: {topic}. Każdy: duża liczba/wartość, emoji ikona, 2-zdaniowy opis. Animacje wejścia kolejno (delay). Kolorowe karty gradient. Ciemny motyw.' },

  { id: 'mind_map', cat: '📊 Wizualizacje', icon: '🗺️', label: 'Mapa myśli',
    desc: 'Interaktywna mapa pojęć SVG z gałęziami',
    prompt: 'Interaktywna mapa myśli SVG: centralny węzeł + 5 głównych gałęzi + 2-3 podgałęzie każda, temat: {topic}. Kliknij węzeł by ukryć/pokazać podgałęzie. Pastelowe kolory. Linie krzywe. Ciemny tło.' },

  // ── 🎮 GRY EDUKACYJNE (5) ───────────────────────────────────
  { id: 'wordle', cat: '🎮 Gry', icon: '🟩', label: 'Wordle',
    desc: 'Zgadnij 5-literowe słowo kluczowe w 6 próbach',
    prompt: 'Gra Wordle po polsku z 5-literowym słowem kluczowym z tematu {topic} w 6 próbach. Kolorowy feedback: zielony=właściwe miejsce, żółty=jest w słowie, szary=brak. Klawiatura ekranowa. Animacje. Ciemny motyw.' },

  { id: 'hangman', cat: '🎮 Gry', icon: '🎪', label: 'Wisielec',
    desc: 'Klasyczna gra z terminami tematu — rysowany SVG',
    prompt: 'Gra Wisielec: 8 terminów z tematu {topic}. Rysuj wisielca SVG krokowo (10 elementów). Litery A-Z do klikania. Podpowiedź po 5 próbach. Licznik wygranych/przegranych. Ciemny motyw.' },

  { id: 'memory_game', cat: '🎮 Gry', icon: '🧠', label: 'Memory',
    desc: 'Gra pamięciowa 16 kart z animacją flip',
    prompt: 'Gra Memory: 16 kart (8 par emoji+nazw związanych z {topic}). Odwracanie kart z animacją CSS flip 3D. Licznik par, czasu i ruchów. Po ukończeniu ekran wyników. Ciemny motyw.' },

  { id: 'wheel', cat: '🎮 Gry', icon: '🎡', label: 'Koło fortuny',
    desc: 'Kręcące koło SVG z pytaniami z tematu',
    prompt: 'Koło fortuny SVG: 8 sektorów — 5 pytań z tematu {topic} + 3 nagrody (Bonus!, ×2, Przerwa). Kliknij Zakręć → animacja obrotu z ease-out → wskaż sektor. Kolorowe sektory. Ciemny motyw.' },

  { id: 'crossword', cat: '🎮 Gry', icon: '🔡', label: 'Krzyżówka',
    desc: 'Mini krzyżówka 5×5 z pojęciami z tematu',
    prompt: 'Mini krzyżówka HTML 5×5 z 5 słowami z tematu {topic}. Kratki z inputami, numerowanie, lista podpowiedzi poziomo/pionowo. Sprawdź odpowiedzi z kolorowym feedbackiem. Ciemny motyw.' },

  // ── 👥 PREZENTACJE (5) ──────────────────────────────────────
  { id: 'persona', cat: '👥 Prezentacje', icon: '🧑', label: 'User Persona',
    desc: 'Karta persony z danymi, celami i frustracjami',
    prompt: 'Karta User Persona dla: {topic}. Imię, wiek, zawód, avatar (duże emoji), 2 cytaty, 3 cele, 3 frustracjie, kanały komunikacji (ikony). Profesjonalny design. Ciemny motyw, niebieski akcent.' },

  { id: 'roadmap', cat: '👥 Prezentacje', icon: '🗓️', label: 'Roadmap',
    desc: 'Harmonogram Q1-Q4 z kamieniami milowymi i statusem',
    prompt: 'Roadmap projektu {topic}: 4 kwartały (Q1-Q4), każdy z 3 kamieniami milowymi. Kolory: ukończony=zielony, aktywny=niebieski, planowany=szary. Wizualna linia czasu. Ciemny motyw.' },

  { id: 'pricing', cat: '👥 Prezentacje', icon: '💳', label: 'Tabela cennika',
    desc: 'Trzy plany z listą funkcji i wyróżnionym środkowym',
    prompt: 'Tabela cennika 3 plany dla {topic}: Basic/Pro/Enterprise. Każdy: cena/mies., 6 features (✓/✗). Środkowy plan wyróżniony "Polecany" z gradientem. Przyciski CTA. Ciemny motyw, złoty akcent.' },

  { id: 'certificate_prev', cat: '👥 Prezentacje', icon: '🏅', label: 'Certyfikat',
    desc: 'Piękny certyfikat z polem na imię i przyciskiem druku',
    prompt: 'Certyfikat ukończenia dla kursu: {topic}. Pole na imię (input), data. Ozdobna ramka CSS, logo placeholder, podpis autora. Przycisk Drukuj (window.print()). Elegancki design. Ciemny motyw.' },

  { id: 'timeline_story', cat: '👥 Prezentacje', icon: '📖', label: 'Story Timeline',
    desc: 'Narracyjna oś czasu z obrazkami i opisami',
    prompt: 'Story Timeline: 5 etapów narracyjnych o: {topic}. Każdy: numer etapu w kółku, tytuł, emoji ilustracja, 2-zdaniowy opis. Kliknięcie otwiera modal z detalami. Animacja scroll-reveal. Ciemny motyw.' },

  { id: 'faq', cat: '👥 Prezentacje', icon: '💬', label: 'FAQ Accordion',
    desc: '8 pytań i odpowiedzi w akordeonie z animacją',
    prompt: 'FAQ Accordion: 8 pytań i odpowiedzi dot: {topic}. Kliknij pytanie by rozwinąć odpowiedź z animacją CSS. Tylko jedno otwarte naraz. Ikony +/- lub strzałki. Wyszukiwarka pytań. Ciemny motyw.' },

  // ── 🛠️ NARZĘDZIA TWÓRCY (5 NEW) ─────────────────────────────
  { id: 'vocabulary', cat: '🛠️ Narzędzia', icon: '📚', label: 'Słownik',
    desc: 'Interaktywny słownik terminów z wyszukiwarką',
    prompt: 'Interaktywny słownik terminów z tematu {topic}: 12 terminów z definicjami. Wyszukiwarka live. Karty: termin widoczny, definicja ukryta (klik=reveal). Zakładki A-Z. Ciemny motyw.' },

  { id: 'note_pad', cat: '🛠️ Narzędzia', icon: '📝', label: 'Notatnik',
    desc: 'Notatnik z formatowaniem dla czytelnika Webooka',
    prompt: 'Notatnik HTML dla czytelnika: textarea z toolbar formatowania (bold, italic, lista), licznik słów. Zapisz do localStorage, eksportuj TXT, wyczyść (z potwierdzeniem). Ciemny motyw, monospace font.' },

  { id: 'summary_cornell', cat: '🛠️ Narzędzia', icon: '📋', label: 'Notatki Cornell',
    desc: 'Szablon notatek Cornell z edytowalnymi polami',
    prompt: 'Notatki Cornell dla: {topic}. Sekcje: Pytania kluczowe (5), Notatki główne (textarea), Podsumowanie. Wszystko edytowalne. Pasek postępu wypełnienia. Przycisk drukuj. Ciemny motyw.' },

  { id: 'reading_stats', cat: '🛠️ Narzędzia', icon: '⏱️', label: 'Czas nauki',
    desc: 'Szacuj czas nauki i plan dzienny',
    prompt: 'Kalkulator czasu nauki: pola liczba stron, typ materiału (łatwy/średni/trudny), cel (egzamin/ogólne). Oblicza: czas czytania, nauki, powtórki. Generuje tygodniowy plan. Ciemny motyw.' },

  { id: 'feedback_form', cat: '🛠️ Narzędzia', icon: '⭐', label: 'Feedback',
    desc: 'Gwiazdki, NPS i pole komentarza z animacją',
    prompt: 'Formularz feedbacku dla rozdziału {topic}: ocena 1-5 gwiazdek (CSS animowane), 2 pytania NPS (slider 0-10), pole tekstowe komentarza, checkbox "Polecam". Animacja potwierdzenia po wysłaniu. Ciemny motyw.' },
]

// ─────────────────────────────────────────────────────────────────
const ALL_CATS = [...new Set(ALL_TOOLS.map(t => t.cat))]

const WRITE_SHORTCUTS = [
  { icon: '📖', label: 'Wstęp rozdziału',     t: 'Napisz angażujący 3-zdaniowy wstęp do rozdziału o: {topic}. Zacznij od prowokującego pytania lub zaskakującego faktu.' },
  { icon: '📝', label: 'Podsumowanie',         t: 'Napisz zwięzłe podsumowanie (bullet points, max 6) kluczowych wniosków z rozdziału o: {topic}.' },
  { icon: '💡', label: 'Pro tip eksperta',     t: 'Podaj 3 nieoczywiste wskazówki praktyczne eksperta na temat: {topic}. Każda zaczyna się od "Pro tip:".' },
  { icon: '🔑', label: 'Definicje terminów',   t: 'Zdefiniuj 5 kluczowych terminów z dziedziny: {topic}. Format: **Termin**: definicja w 1-2 zdaniach.' },
  { icon: '❓', label: 'Pytania refleksyjne',  t: 'Zaproponuj 4 pytania do głębokiej refleksji po przeczytaniu rozdziału o: {topic}.' },
  { icon: '📣', label: 'Call to action',        t: 'Napisz krótkie, energetyczne CTA (50 słów) zachęcające czytelnika do ćwiczenia wiedzy o: {topic}.' },
  { icon: '🎯', label: 'Cele nauki',            t: 'Sformułuj 4 konkretne cele nauki dla modułu o: {topic}. Format: "Po ukończeniu będziesz potrafić..."' },
  { icon: '🔄', label: 'Analogia/Metafora',    t: 'Wyjaśnij koncepcję: {topic} za pomocą prostej analogii porównującej do czegoś codziennego.' },
  { icon: '⚠️', label: 'Częste błędy',         t: 'Wymień 5 najczęstszych błędów początkujących w temacie: {topic}. Każdy z wyjaśnieniem.' },
  { icon: '📊', label: 'Dane i statystyki',    t: 'Podaj 5 interesujących danych/statystyk związanych z: {topic}. Z kontekstem.' },
  { icon: '🌍', label: 'Case study',            t: 'Opisz case study ilustrujący zastosowanie: {topic}. Kontekst → problem → rozwiązanie → wynik.' },
  { icon: '🗓️', label: 'Plan ćwiczeń',         t: 'Zaproponuj 7-dniowy plan ćwiczeń (15-30 min/dzień) do opanowania: {topic}.' },
]

const TRANSLATE_LANGS = [
  { code: 'en', label: '🇬🇧 Angielski' }, { code: 'de', label: '🇩🇪 Niemiecki' },
  { code: 'fr', label: '🇫🇷 Francuski' }, { code: 'es', label: '🇪🇸 Hiszpański' },
  { code: 'uk', label: '🇺🇦 Ukraiński' }, { code: 'cs', label: '🇨🇿 Czeski' },
  { code: 'it', label: '🇮🇹 Włoski' },   { code: 'nl', label: '🇳🇱 Niderlandzki' },
]

const DEMO_HTML = `<!DOCTYPE html><html><head>
<meta charset="UTF-8">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:system-ui,sans-serif;background:#060E1C;color:#F0F4FF;padding:20px;min-height:280px;display:flex;flex-direction:column;align-items:center;justify-content:center}
h2{font-size:17px;font-weight:800;margin-bottom:18px;background:linear-gradient(135deg,#1E6FDB,#EA6C1E);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-align:center}
.card{background:#0A1628;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:20px;width:100%;max-width:380px}
.row{display:flex;gap:10px;margin-bottom:10px;align-items:center}
label{font-size:11px;color:#4D6A8A;text-transform:uppercase;letter-spacing:.08em;min-width:90px}
input[type=number]{flex:1;background:#162844;border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:8px 10px;color:#F0F4FF;font-size:13px;outline:none}
.result{background:linear-gradient(135deg,rgba(30,111,219,.15),rgba(234,108,30,.1));border:1px solid rgba(30,111,219,.3);border-radius:12px;padding:14px;text-align:center;margin-top:14px}
.rv{font-size:32px;font-weight:800;background:linear-gradient(135deg,#1E6FDB,#F59E0B);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.rl{font-size:11px;color:#4D6A8A;text-transform:uppercase;margin-top:4px}
.sub{font-size:12px;color:#9BB0CC;margin-top:8px}
</style></head><body>
<div class="card"><h2>⚡ Kalkulator ROI</h2>
<div class="row"><label>Inwestycja</label><input type="number" id="i" value="10000" oninput="c()"/>zł</div>
<div class="row"><label>Przychód</label><input type="number" id="r" value="25000" oninput="c()"/>zł</div>
<div class="row"><label>Koszty</label><input type="number" id="k" value="5000" oninput="c()"/>zł</div>
<div class="result"><div class="rv" id="roi">100%</div><div class="rl">ROI</div>
<div class="sub">Zysk: <b id="pr" style="color:#34d399">10 000 zł</b></div></div>
</div>
<script>function c(){const i=+document.getElementById('i').value||1,r=+document.getElementById('r').value,k=+document.getElementById('k').value;const p=r-k-i;document.getElementById('roi').textContent=((p/i)*100).toFixed(1)+'%';const el=document.getElementById('pr');el.textContent=p.toLocaleString('pl-PL')+' zł';el.style.color=p>=0?'#34d399':'#f87171'}</script>
</body></html>`

interface Props { onInsertBlock: (b: Block) => void; chapterContent: string }
type Tab = 'tools' | 'write' | 'translate' | 'proofread' | 'import' | 'style'

export default function AIStudio({ onInsertBlock, chapterContent }: Props) {
  const [tab, setTab] = useState<Tab>('tools')
  const [cat, setCat] = useState(ALL_CATS[0])
  const [topic, setTopic] = useState('')
  const [customPrompt, setCustomPrompt] = useState('')
  const [writePrompt, setWritePrompt] = useState('')
  const [targetLang, setTargetLang] = useState('en')
  const [loading, setLoading] = useState(false)
  const [loadingLabel, setLoadingLabel] = useState('AI generuje...')
  const [result, setResult] = useState<{ html: string; label: string } | null>(null)
  const [proofResult, setProofResult] = useState<string | null>(null)
  const [importText, setImportText] = useState('')
  const [expandedTool, setExpandedTool] = useState<string | null>(null)
  const [lastPrompt, setLastPrompt] = useState('')

  async function generateTool(prompt: string, label: string) {
    setLoading(true)
    setResult(null)
    setLastPrompt(prompt)
    setLoadingLabel(`Generuję: ${label}...`)
    await new Promise(r => setTimeout(r, 2200))
    setLoading(false)
    setResult({ html: DEMO_HTML, label })
    toast.success('✅ Narzędzie wygenerowane!')
  }

  async function generateText() {
    if (!writePrompt.trim()) return toast.error('Wpisz treść zlecenia')
    setLoading(true)
    setLoadingLabel('Claude pisze treść...')
    await new Promise(r => setTimeout(r, 1400))
    setLoading(false)
    const b = createBlock('paragraph')
    b.content = `[Wygenerowano przez AI: "${writePrompt.slice(0, 60)}..." – w produkcji Claude API zwróci pełną treść.]`
    onInsertBlock(b)
    toast.success('✅ Treść wstawiona jako blok!')
    setWritePrompt('')
  }

  async function proofread() {
    setLoading(true)
    setLoadingLabel('Claude analizuje tekst...')
    await new Promise(r => setTimeout(r, 1500))
    setLoading(false)
    setProofResult(
      `📊 Analiza rozdziału:\n\n` +
      `✅ Ortografia: brak błędów\n` +
      `✅ Interpunkcja: 1 sugestia (zdanie 4)\n\n` +
      `🎯 Sugestie stylistyczne:\n` +
      `• Zdanie 3: rozważ skrócenie (>35 słów)\n` +
      `• Zdanie 7: „bardzo dużo" → „znacznie"\n` +
      `• Paragrafy 2-3 mogą być scalone\n\n` +
      `📖 Czytelność (Flesch): 68/100 (Dobra)\n` +
      `📏 Długość: ${chapterContent.length} znaków`
    )
  }

  async function translate() {
    setLoading(true)
    setLoadingLabel('Claude tłumaczy...')
    await new Promise(r => setTimeout(r, 2500))
    setLoading(false)
    const lang = TRANSLATE_LANGS.find(l => l.code === targetLang)?.label.split(' ')[1]
    toast.success(`✅ Rozdział przetłumaczony na ${lang}!`)
  }

  function insertTool() {
    if (!result) return
    const b = createBlock('interactive_tool')
    b.content = result.html
    b.props = { height: 340, source: 'ai-studio', label: result.label }
    onInsertBlock(b)
    setResult(null)
    toast.success('🎉 Narzędzie wstawione do Webooka!')
  }

  function importAsBlock() {
    if (!importText.trim()) return
    const b = createBlock('paragraph')
    b.content = importText.trim()
    onInsertBlock(b)
    setImportText('')
    toast.success('✅ Tekst zaimportowany!')
  }

  const catTools = ALL_TOOLS.filter(t => t.cat === cat)

  const TABS: { id: Tab; icon: React.ReactNode; label: string }[] = [
    { id: 'tools',     icon: <Zap size={9}/>,      label: 'Narzędzia' },
    { id: 'write',     icon: <Wand2 size={9}/>,     label: 'Pisz' },
    { id: 'translate', icon: <Globe size={9}/>,     label: 'Tłumacz' },
    { id: 'proofread', icon: <Search size={9}/>,    label: 'Korekta' },
    { id: 'import',    icon: <FileText size={9}/>,  label: 'Import' },
    { id: 'style',     icon: <Palette size={9}/>,   label: 'Styl' },
  ]

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* HEADER */}
      <div className="px-3 pt-3 pb-2.5 border-b border-white/[0.05] flex-shrink-0 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-5.5 h-5.5 w-6 h-6 rounded-md bg-gradient-to-br from-brand-blue to-brand-gold flex items-center justify-center">
              <Sparkles size={11} className="text-white" />
            </div>
            <div>
              <div className="font-display font-700 text-[11px] text-ink">AI Studio</div>
              <div className="text-[8px] text-brand-gold/50 font-mono">{ALL_TOOLS.length} narzędzi · claude-sonnet</div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-slow" />
            <span className="text-[8.5px] text-emerald-400/60">aktywny</span>
          </div>
        </div>

        <input
          className="input text-[11px] py-1.5 placeholder:text-ink-3"
          placeholder="🏷️ Temat kursu / kontekst..."
          value={topic}
          onChange={e => setTopic(e.target.value)}
        />

        {/* Tabs 3+3 */}
        <div className="grid grid-cols-3 gap-0.5 bg-surface-2 rounded-xl p-0.5">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center justify-center gap-1 py-1.5 rounded-[10px] text-[9px] font-600 transition-all
                ${tab === t.id ? 'bg-surface-0 text-ink shadow-sm' : 'text-ink-3 hover:text-ink-2'}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto">

        {/* ── TOOLS ────────────────────────────── */}
        {tab === 'tools' && (
          <div className="p-2.5 space-y-2">
            {/* Category pills */}
            <div className="flex gap-1 overflow-x-auto scrollbar-none pb-0.5">
              {ALL_CATS.map(c => (
                <button key={c} onClick={() => { setCat(c); setExpandedTool(null) }}
                  className={`px-2 py-1 rounded-lg text-[9px] font-600 whitespace-nowrap flex-shrink-0 transition-all
                    ${cat === c
                      ? 'bg-brand-blue/15 text-brand-light border border-brand-blue/25'
                      : 'bg-surface-3 text-ink-3 hover:text-ink-2 border border-transparent'}`}>
                  {c}
                </button>
              ))}
            </div>

            {/* Tool list */}
            <div className="space-y-1">
              {catTools.map(tool => (
                <div key={tool.id} className="rounded-xl bg-surface-3 border border-white/[0.05] overflow-hidden">
                  <button
                    onClick={() => setExpandedTool(expandedTool === tool.id ? null : tool.id)}
                    className="w-full flex items-center gap-2 px-2.5 py-2 hover:bg-white/[0.025] transition-colors group"
                  >
                    <span className="text-base leading-none flex-shrink-0 group-hover:scale-110 transition-transform">{tool.icon}</span>
                    <div className="flex-1 text-left min-w-0">
                      <div className="text-[11px] font-600 text-ink truncate">{tool.label}</div>
                      <div className="text-[9px] text-ink-3 truncate leading-tight">{tool.desc}</div>
                    </div>
                    <ChevronRight size={11} className={`text-ink-3 flex-shrink-0 transition-transform ${expandedTool === tool.id ? 'rotate-90' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {expandedTool === tool.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="border-t border-white/[0.05] px-2.5 py-2 bg-surface-2/50 space-y-2"
                      >
                        <div className="text-[9px] text-ink-3 bg-surface-3/60 rounded-lg p-1.5 leading-relaxed">
                          {tool.prompt.replace('{topic}', topic || '<temat>').slice(0, 100)}…
                        </div>
                        <div className="flex gap-1.5">
                          <input
                            className="input flex-1 text-[10px] py-1.5"
                            placeholder="Doprecyzuj (opcjonalnie)"
                            onKeyDown={e => e.key === 'Enter' && generateTool(
                              tool.prompt.replace('{topic}', topic || 'tej lekcji'),
                              tool.label
                            )}
                          />
                          <button
                            onClick={() => generateTool(tool.prompt.replace('{topic}', topic || 'tej lekcji'), tool.label)}
                            disabled={loading}
                            className="btn-gold py-1.5 px-2.5 text-[10px] flex-shrink-0 disabled:opacity-40"
                          >
                            {loading ? <Loader2 size={10} className="animate-spin" /> : <Zap size={10} />}
                            Generuj
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Custom prompt */}
            <div className="border-t border-white/[0.04] pt-2">
              <div className="text-[9.5px] font-600 text-ink-2 mb-1.5 flex items-center gap-1"><Brain size={9}/>Własny prompt</div>
              <div className="bg-surface-3 border border-white/[0.06] rounded-xl overflow-hidden">
                <textarea
                  value={customPrompt}
                  onChange={e => setCustomPrompt(e.target.value)}
                  placeholder="Opisz dowolne narzędzie interaktywne HTML..."
                  className="w-full bg-transparent border-none outline-none text-[10.5px] text-ink p-2.5 resize-none h-14 placeholder:text-ink-3"
                />
                <div className="border-t border-white/[0.04] px-2.5 py-1.5 flex justify-between items-center">
                  <span className="text-[8.5px] text-ink-3">{customPrompt.length}/2000</span>
                  <button
                    onClick={() => customPrompt.trim() && generateTool(customPrompt, 'własne narzędzie')}
                    disabled={loading || !customPrompt.trim()}
                    className="btn-gold py-1 px-2.5 text-[9.5px] disabled:opacity-40"
                  >
                    {loading ? <Loader2 size={9} className="animate-spin" /> : <Send size={9} />}
                    Generuj
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── WRITE ────────────────────────────── */}
        {tab === 'write' && (
          <div className="p-2.5 space-y-2">
            <p className="text-[10px] text-ink-2 leading-relaxed">Generuj treść — blok zostanie wstawiony do edytora.</p>
            <div className="space-y-1">
              {WRITE_SHORTCUTS.map(({ icon, label, t }) => (
                <button key={label}
                  onClick={() => setWritePrompt(t.replace('{topic}', topic || '...'))}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl bg-surface-3 border border-white/[0.05] hover:bg-surface-4 text-left transition-all group"
                >
                  <span className="text-sm flex-shrink-0 group-hover:scale-110 transition-transform">{icon}</span>
                  <span className="text-[10.5px] font-500 text-ink-2 group-hover:text-ink">{label}</span>
                </button>
              ))}
            </div>
            <div className="border-t border-white/[0.04] pt-2">
              <div className="bg-surface-3 border border-white/[0.06] rounded-xl overflow-hidden">
                <textarea
                  value={writePrompt}
                  onChange={e => setWritePrompt(e.target.value)}
                  placeholder="Co napisać? Np. 'Wyjaśnij X', 'Napisz intro do modułu Z'..."
                  className="w-full bg-transparent border-none outline-none text-[10.5px] text-ink p-2.5 resize-none h-20 placeholder:text-ink-3"
                />
                <div className="border-t border-white/[0.04] px-2.5 py-1.5 flex items-center justify-between">
                  <span className="text-[8.5px] text-ink-3">→ wstawi blok do edytora</span>
                  <button onClick={generateText} disabled={loading || !writePrompt.trim()}
                    className="btn-primary py-1.5 px-2.5 text-[10px] disabled:opacity-40">
                    {loading ? <Loader2 size={10} className="animate-spin" /> : <Wand2 size={10} />}
                    Wygeneruj
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TRANSLATE ────────────────────────── */}
        {tab === 'translate' && (
          <div className="p-2.5 space-y-2.5">
            <p className="text-[10px] text-ink-2 leading-relaxed">Przetłumacz cały rozdział zachowując strukturę bloków.</p>
            <div className="grid grid-cols-2 gap-1.5">
              {TRANSLATE_LANGS.map(lang => (
                <button key={lang.code} onClick={() => setTargetLang(lang.code)}
                  className={`px-2 py-2 rounded-xl text-[10px] font-500 transition-all text-left
                    ${targetLang === lang.code
                      ? 'bg-brand-blue/15 text-brand-light border border-brand-blue/30'
                      : 'bg-surface-3 text-ink-2 border border-white/[0.05] hover:bg-surface-4'}`}>
                  {lang.label}
                </button>
              ))}
            </div>
            <div className="bg-surface-3 border border-white/[0.05] rounded-xl p-2.5 space-y-1">
              {['Bloki tekstowe', 'Nagłówki', 'Pytania quizowe', 'Callouts i notatki', 'Fiszki i checklisty'].map(item => (
                <div key={item} className="flex items-center gap-1.5 text-[9.5px] text-ink-2">
                  <span className="text-emerald-400">✓</span> {item}
                </div>
              ))}
            </div>
            <button onClick={translate} disabled={loading} className="btn-primary w-full justify-center py-2.5 text-xs">
              {loading ? <><Loader2 size={12} className="animate-spin" />Tłumaczę...</> : <><Globe size={12} />Tłumacz rozdział</>}
            </button>
          </div>
        )}

        {/* ── PROOFREAD ────────────────────────── */}
        {tab === 'proofread' && (
          <div className="p-2.5 space-y-2.5">
            <div className="space-y-1.5">
              {[
                { icon: '🔤', label: 'Ortografia i gramatyka',  sub: 'Literówki, błędy deklinacji' },
                { icon: '✂️', label: 'Styl i zwięzłość',        sub: 'Długie zdania, powtórzenia' },
                { icon: '📊', label: 'Czytelność (Flesch)',     sub: 'Indeks czytelności 0-100' },
                { icon: '🔄', label: 'Spójność terminów',       sub: 'Konsekwentne nazewnictwo' },
                { icon: '🎯', label: 'Ton i głos',              sub: 'Profesjonalny vs potoczny' },
              ].map(({ icon, label, sub }) => (
                <div key={label} className="flex items-start gap-2 px-2.5 py-2 bg-surface-3 rounded-xl">
                  <span className="text-sm mt-0.5">{icon}</span>
                  <div>
                    <div className="text-[10.5px] font-600 text-ink">{label}</div>
                    <div className="text-[9px] text-ink-3">{sub}</div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={proofread} disabled={loading} className="btn-primary w-full justify-center py-2.5 text-xs">
              {loading ? <><Loader2 size={12} className="animate-spin" />Sprawdzam...</> : <><Search size={12} />Analizuj rozdział</>}
            </button>
            <AnimatePresence>
              {proofResult && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-surface-3 border border-white/[0.06] rounded-xl p-2.5 relative">
                  <button onClick={() => setProofResult(null)} className="absolute top-2 right-2 text-ink-3 hover:text-ink"><X size={10}/></button>
                  <pre className="text-[10px] text-ink-2 whitespace-pre-wrap leading-relaxed font-body pr-4">{proofResult}</pre>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ── IMPORT ───────────────────────────── */}
        {tab === 'import' && (
          <div className="p-2.5 space-y-2.5">
            <p className="text-[10px] text-ink-2 leading-relaxed">Wklej tekst zewnętrzny — zostanie wstawiony jako blok.</p>
            {[
              { icon: '📋', label: 'Wklej tekst',     active: true  },
              { icon: '📄', label: 'Import z PDF',     active: false },
              { icon: '📝', label: 'Import z .docx',   active: false },
              { icon: '🌐', label: 'Import z URL',     active: false },
            ].map(({ icon, label, active }) => (
              <div key={label}
                className={`flex items-center gap-2 px-2.5 py-2 rounded-xl text-[10px]
                  ${active ? 'bg-brand-blue/10 border border-brand-blue/20 text-ink font-600' : 'bg-surface-3 border border-white/[0.05] text-ink-3'}`}>
                <span>{icon}</span> {label}
                {!active && <span className="ml-auto text-[8.5px] bg-surface-2 px-1.5 py-0.5 rounded-md">Wkrótce</span>}
              </div>
            ))}
            <div className="bg-surface-3 border border-white/[0.06] rounded-xl overflow-hidden">
              <textarea value={importText} onChange={e => setImportText(e.target.value)}
                placeholder="Wklej tekst..."
                className="w-full bg-transparent border-none outline-none text-[10.5px] text-ink p-2.5 resize-none h-28 placeholder:text-ink-3" />
              <div className="border-t border-white/[0.04] px-2.5 py-1.5 flex justify-between items-center">
                <span className="text-[8.5px] text-ink-3">{importText.length} znaków</span>
                <button onClick={importAsBlock} disabled={!importText.trim()}
                  className="btn-primary py-1.5 px-2.5 text-[10px] disabled:opacity-40">
                  <Plus size={10}/> Wstaw blok
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── STYLE ────────────────────────────── */}
        {tab === 'style' && (
          <div className="p-2.5 space-y-3">
            <p className="text-[10px] text-ink-2 leading-relaxed">Wygląd czytnika dla czytelników Webooka.</p>

            <div>
              <div className="label mb-2">Motyw czytnika</div>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'dark',  label: '🌑 Ciemny',  bg: '#060E1C', fg: '#F0F4FF' },
                  { id: 'light', label: '☀️ Jasny',   bg: '#F8FAFC', fg: '#0A1628' },
                  { id: 'sepia', label: '📜 Sepia',   bg: '#1C1510', fg: '#E8D5B0' },
                ].map(t => (
                  <button key={t.id}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl bg-surface-3 border border-white/[0.06] hover:bg-surface-4 transition-all
                      ${t.id === 'dark' ? 'border-brand-blue/40' : ''}`}>
                    <div className="w-10 h-6 rounded border border-white/10 flex items-center justify-center text-[9px] font-700"
                      style={{ background: t.bg, color: t.fg }}>Aa</div>
                    <span className="text-[9px] text-ink-2">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="label mb-2">Czcionka</div>
              <div className="space-y-1">
                {[
                  { id: 'default', label: 'Satoshi (Sans)',   preview: 'Przykład tekstu' },
                  { id: 'serif',   label: 'Playfair (Serif)', preview: 'Przykład tekstu' },
                  { id: 'mono',    label: 'JetBrains (Mono)', preview: 'Przykład tekstu' },
                ].map(f => (
                  <button key={f.id}
                    className="w-full flex justify-between items-center px-2.5 py-2 rounded-xl bg-surface-3 border border-white/[0.05] hover:bg-surface-4 transition-all">
                    <span className="text-[10.5px] font-600 text-ink">{f.label}</span>
                    <span className="text-[10px] text-ink-3">{f.preview}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="label mb-2">Kolor akcentu</div>
              <div className="flex gap-1.5 flex-wrap">
                {['#1E6FDB','#8B5CF6','#10B981','#F59E0B','#EF4444','#EC4899','#06B6D4','#EA6C1E'].map(color => (
                  <button key={color} style={{ background: color }}
                    className="w-7 h-7 rounded-lg border-2 border-transparent hover:border-white/40 transition-all hover:scale-110" />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI RESULT FOOTER */}
      <AnimatePresence>
        {(loading || result) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/[0.05] bg-surface-1 flex-shrink-0 overflow-hidden"
          >
            {loading ? (
              <div className="flex items-center gap-2 px-3 py-2.5 text-[10.5px] text-brand-blue">
                <Loader2 size={11} className="animate-spin flex-shrink-0" />
                {loadingLabel}
              </div>
            ) : result && (
              <div className="p-2.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-600 text-emerald-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {result.label} — podgląd
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => setResult(null)} className="block-action-btn"><X size={9}/></button>
                    <button onClick={() => generateTool(lastPrompt, result.label)} className="block-action-btn" title="Regeneruj">
                      <RefreshCw size={9}/>
                    </button>
                  </div>
                </div>
                <div className="rounded-xl overflow-hidden border border-white/[0.06]">
                  <iframe srcDoc={result.html} className="w-full border-none" style={{ height: 172 }}
                    sandbox="allow-scripts" title="AI Tool Preview" />
                </div>
                <button onClick={insertTool} className="btn-gold w-full justify-center py-2 text-xs">
                  <Plus size={12}/> Wstaw do Webooka
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
