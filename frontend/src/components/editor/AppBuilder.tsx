// ═══════════════════════════════════════════════════════════════════════
// WEBOOK STUDIO 4.0 — APP BUILDER
// Generator interaktywnych mini-aplikacji przez prompt
// 25 szablonów · Live preview · Code editor · Wstaw do Webooka
// ═══════════════════════════════════════════════════════════════════════
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Sparkles, Loader2, Plus, Download, RefreshCw,
  ChevronRight, Eye, Code2, Maximize2, Minimize2,
  Smartphone, Tablet, Monitor, Copy, CheckCheck,
  Wand2, Zap, Play, Pause, RotateCcw, ExternalLink,
  Gamepad2, Calculator, BarChart2, BookOpen, Brain,
  Clock, Palette, Target, Music, Map, ShoppingBag,
  MessageSquare, Star, Award, Layers, Settings,
  PenTool, Image, Video, ChevronDown, SplitSquareHorizontal
} from 'lucide-react'
import { toast } from 'sonner'
import type { Block } from '../../lib/blocks'
import { createBlock } from '../../lib/blocks'

// ─── 25 SZABLONÓW MINI-APLIKACJI ─────────────────────────────────────────────
const APP_TEMPLATES = [

  // ── 🎮 GRY ────────────────────────────────────────────────────
  { id: 'trivia_game', cat: '🎮 Gry', icon: '🧠', color: '#8B5CF6',
    label: 'Trivia Game',
    desc: 'Gra wiedzy z punktami, poziomami i tablicą wyników',
    complexity: 'medium',
    prompt: `Zbuduj KOMPLETNĄ grę Trivia w HTML/CSS/JS:
MECHANIKA:
- 3 poziomy trudności (Łatwy 10pkt / Średni 20pkt / Trudny 30pkt)
- 10 pytań wielokrotnego wyboru z tematu: {topic}
- Timer 30 sekund na pytanie (animowany pasek)
- Bonus: +10pkt za szybką odpowiedź (<10s)
- Combo: ×2 za 3 z rzędu poprawne
UI:
- Ekran startowy z wyborem poziomu
- Animowane przejście między pytaniami
- Kolorowy feedback (zielony/czerwony) + confetti przy dobrym
- Tablica wyników (Top 5 sesji) w localStorage
- Ekran końcowy z oceną (A-F) i statystykami
DESIGN: Ciemny motyw #060E1C, gradient tło, fonty system-ui, zaokrąglone karty.
Zwróć TYLKO kompletny HTML bez komentarzy.` },

  { id: 'word_game', cat: '🎮 Gry', icon: '🔤', color: '#06B6D4',
    label: 'Word Challenge',
    desc: 'Gra słowna z anagramami, wisielcem lub wordle w jednej aplikacji',
    complexity: 'medium',
    prompt: `Zbuduj kompletną aplikację Word Challenge z 3 mini-grami w HTML/CSS/JS:
MINI-GRA 1 — ANAGRAM: Ułóż litery w poprawne słowo (8 słów z tematu {topic})
MINI-GRA 2 — WISIELEC: Zgadnij słowo kluczowe, rysowany SVG (6 słów)
MINI-GRA 3 — SZYBKIE PYTANIA: 10 pytań def→termin, 5 sekund każde
NAWIGACJA: Zakładki między mini-grami, scoring globalny, progress bar
UI: Ciemny motyw, animacje, responsywny. Tylko HTML/CSS/JS.` },

  { id: 'puzzle_game', cat: '🎮 Gry', icon: '🧩', color: '#EC4899',
    label: 'Puzzle / Układanka',
    desc: 'Logiczna układanka lub puzzle edukacyjny',
    complexity: 'hard',
    prompt: `Zbuduj interaktywną aplikację puzzle/układanka w HTML/CSS/JS:
TYP: Puzzle koncepcyjne z tematu {topic}
MOŻLIWOŚCI:
- 9-kafelkowa siatka (3×3) z shufflowanymi elementami edukacyjnymi
- Drag-and-drop kafelków do poprawnych pozycji
- Lub: wersja "klikanki" (15-puzzle slide)
- Timer, licznik ruchów, najlepszy wynik (localStorage)
- Animacja wygranej (confetti + układa się finał)
ALTERNATYWA: Jeśli puzzle nieodpowiednie dla tematu — stwórz logiczną grę dopasowania 4×4
UI: Ciemny motyw, płynne animacje CSS, responsywny.` },

  { id: 'simulation', cat: '🎮 Gry', icon: '⚙️', color: '#F59E0B',
    label: 'Symulacja / Simulator',
    desc: 'Interaktywna symulacja procesu lub zjawiska z tematu',
    complexity: 'hard',
    prompt: `Zbuduj interaktywną SYMULACJĘ w HTML/CSS/JS dla tematu: {topic}
CEL: Wizualizacja i symulacja kluczowego procesu/zjawiska z tego tematu
ELEMENTY:
- Animowana wizualizacja (SVG lub Canvas) procesu
- Suwaki/przyciski do zmiany parametrów symulacji
- Panel z wartościami liczbowymi aktualizowanymi w czasie rzeczywistym
- Legenda i opisy elementów
- Przyciski: Start/Pauza/Reset/Przyspiesz
- Opcjonalnie: wykres historii parametrów
UI: Ciemny motyw naukowy, precyzyjny design, animacje CSS/JS. Standalone HTML.` },

  { id: 'escape_room', cat: '🎮 Gry', icon: '🔐', color: '#EF4444',
    label: 'Mini Escape Room',
    desc: '3-etapowa łamigłówka z zagadkami edukacyjnymi',
    complexity: 'hard',
    prompt: `Zbuduj MINI ESCAPE ROOM w HTML/CSS/JS na temat {topic}:
FABUŁA: Gracz utknął w wirtualnym pokoju, musi rozwiązać 3 zagadki by uciec
ETAP 1: Zagadka tekstowa (odpowiedź pisemna — termin z tematu)
ETAP 2: Logiczna układanka (ułóż elementy, dopasuj pary)
ETAP 3: Kod do zamka (odpowiedz na 3 pytania → 3 cyfry kodu)
FINAŁ: Animacja "ucieczki" + statystyki (czas, podpowiedzi)
UI: Klimatyczny ciemny design, font mono, efekty typewriter, dźwięki Web Audio API.
Responsywny, standalone HTML.` },

  // ── 📊 NARZĘDZIA ANALITYCZNE ──────────────────────────────────
  { id: 'dashboard_app', cat: '📊 Analityka', icon: '📊', color: '#10B981',
    label: 'Dashboard analityczny',
    desc: 'Mini dashboard z wykresami, KPI i filtrami danych',
    complexity: 'hard',
    prompt: `Zbuduj mini DASHBOARD analityczny w HTML/CSS/JS dla tematu: {topic}
ELEMENTY:
- 4 karty KPI (kluczowe wskaźniki) z wartościami i trendem ↑↓
- Wykres słupkowy SVG (6-8 danych, animowany ładowanie)
- Wykres kołowy SVG (rozkład kategorii)
- Tabela danych (5 wierszy, sortowalna po kolumnie)
- Filtry: period (tydzień/miesiąc/rok), kategoria
- Tooltip na wykresach z wartościami
- Eksport danych CSV (generuje plik)
UI: Profesjonalny ciemny dashboard, grid layout, karty z glow, responsywny.
DANE: Realistyczne, fikcyjne dane związane z tematem. Standalone HTML.` },

  { id: 'calculator_app', cat: '📊 Analityka', icon: '🧮', color: '#3B82F6',
    label: 'Kalkulator wielofunkcyjny',
    desc: 'Zaawansowany kalkulator dziedzinowy z historią i wzorami',
    complexity: 'medium',
    prompt: `Zbuduj KALKULATOR DZIEDZINOWY w HTML/CSS/JS dla: {topic}
TRYBY (zakładki):
1. Podstawowy kalkulator dla {topic} (3-5 pól wejściowych, wynik)
2. Porównanie scenariuszy (2 kolumny, obok siebie)
3. Kalkulator "co jeśli" (suwaki, wynik aktualizowany na bieżąco)
DODATKOWE FUNKCJE:
- Historia ostatnich 10 obliczeń (localStorage)
- Wyjaśnienie wzoru matematycznego (ukryte, klik = pokaż)
- Eksport wyników do TXT
- Walidacja inputów z komunikatami błędów
UI: Ciemny motyw, numeryczne inputy z labelami, wyróżniony wynik (duży font). Standalone HTML.` },

  { id: 'comparison_app', cat: '📊 Analityka', icon: '⚖️', color: '#F97316',
    label: 'Porównywarka',
    desc: 'Porównaj opcje z dynamicznym scoringiem i rekomendacją',
    complexity: 'medium',
    prompt: `Zbuduj PORÓWNYWARKĘ OPCJI w HTML/CSS/JS dla: {topic}
STRUKTURA:
- 3 opcje do porównania (edytowalne nazwy)
- 6 kryteriów z wagami (suwak 0-100% per kryterium)
- Ocena każdej opcji (0-10 gwiazdkami lub suwakiem)
- Live obliczanie wyniku ważonego
- Radar chart SVG pokazujący profil każdej opcji
- Rekomendacja z uzasadnieniem (zwycięzca + dlaczego)
- Export porównania jako obrazek (html2canvas snippet)
UI: Kolorowe kolumny per opcja, ciemny motyw, animowane wyniki. Standalone HTML.` },

  { id: 'tracker_app', cat: '📊 Analityka', icon: '📈', color: '#A855F7',
    label: 'Tracker / Monitor',
    desc: 'Śledzenie wartości w czasie z wykresem postępu',
    complexity: 'medium',
    prompt: `Zbuduj TRACKER z historią w HTML/CSS/JS dla: {topic}
FUNKCJE:
- Dodawanie wpisów (data + wartość + notatka)
- Wykres liniowy SVG historii (ostatnie 30 wpisów)
- Statystyki: min/max/średnia/trend
- Cel do osiągnięcia (pasek postępu do celu)
- Kategorie/tagi dla wpisów
- LocalStorage do przechowywania danych
- Export CSV / Wyczyść historię (z potwierdzeniem)
UI: Ciemny motyw, timeline layout, kolorowe trendy (zielony wzrost, czerwony spadek). Standalone HTML.` },

  // ── 📚 EDUKACYJNE ─────────────────────────────────────────────
  { id: 'tutor_app', cat: '📚 Edukacyjne', icon: '🎓', color: '#14B8A6',
    label: 'Mini Tutor',
    desc: 'Interaktywny samouczek krok po kroku z ćwiczeniami',
    complexity: 'hard',
    prompt: `Zbuduj INTERAKTYWNY SAMOUCZEK w HTML/CSS/JS dla: {topic}
STRUKTURA (4 moduły):
1. INTRO: Animowana prezentacja kluczowych pojęć (klikaj by przejść)
2. TEORIA: Expandable sekcje z treścią + pytania sprawdzające przy każdej
3. ĆWICZENIA: 5 interaktywnych ćwiczeń (quiz + uzupełnianie + dopasowanie)
4. PODSUMOWANIE: Mapa pojęć + wynik końcowy + certyfikat
NAWIGACJA: Progress bar, powrót do poprzedniego, skip
UI: Jasny/ciemny toggle, step-by-step, animacje między modułami. Standalone HTML.` },

  { id: 'flashcard_app', cat: '📚 Edukacyjne', icon: '🃏', color: '#FBBF24',
    label: 'Aplikacja Fiszek',
    desc: 'Pełna aplikacja do nauki fiszek z algorytmem powtórek',
    complexity: 'medium',
    prompt: `Zbuduj APLIKACJĘ DO NAUKI FISZEK (spaced repetition) w HTML/CSS/JS dla: {topic}
TALII: 15 fiszek (przód: pojęcie/pytanie, tył: definicja/odpowiedź)
TRYBY:
1. NAUKA: Flip 3D, przyciski "Wiem" / "Nie wiem" / "Trudne"
2. POWTÓRKA: Algorytm powtórek (trudne wracają częściej)
3. TEST: Wpisz odpowiedź — porównanie z oryginałem
STATYSTYKI:
- Pasek postępu talii, % opanowanych
- Streak dzienny (localStorage)
- Wykres sesji nauki
UI: Piękne karty 3D flip CSS, ciemny motyw, animacje. Standalone HTML.` },

  { id: 'timeline_app', cat: '📚 Edukacyjne', icon: '📅', color: '#34D399',
    label: 'Interaktywna oś czasu',
    desc: 'Chronologiczna mapa wydarzeń z detalami i filtrami',
    complexity: 'medium',
    prompt: `Zbuduj INTERAKTYWNĄ OŚ CZASU w HTML/CSS/JS dla: {topic}
ZAWARTOŚĆ: 10-12 kluczowych wydarzeń/etapów chronologicznie
PER WYDARZENIE:
- Data/rok, tytuł, emoji ikona
- Krótki opis (2-3 zdania)
- Modal z detalami po kliknięciu
- Opcjonalne: zdjęcie placeholder (emoji na tle gradientu)
FUNKCJE:
- Filtrowanie po kategoriach (min. 3 kategorie)
- Zoom: widok dziesiątek/lat/całości
- Wyszukiwanie po słowach kluczowych
- Pozioma i pionowa oś (toggle)
UI: Nowoczesna oś z markerami, ciemny motyw, animacje. Standalone HTML.` },

  { id: 'glossary_app', cat: '📚 Edukacyjne', icon: '📖', color: '#60A5FA',
    label: 'Interaktywny słownik',
    desc: 'Słownik pojęć z wyszukiwarką, filtrowaniem i quizem',
    complexity: 'medium',
    prompt: `Zbuduj INTERAKTYWNY SŁOWNIK POJĘĆ w HTML/CSS/JS dla: {topic}
ZAWARTOŚĆ: 20 terminów z definicjami, przykładami i kategorią
WIDOKI:
1. Lista alfabetyczna z wyszukiwarką live
2. Karty pojęć (grid) z filtrowaniem po kategorii
3. Losowe pojęcie + mini-quiz (zgadnij termin z definicji)
PER POJĘCIE:
- Termin + IPA/wymowa (opcjonalnie)
- Definicja prosta (1-2 zdania) + rozbudowana
- Przykład użycia
- Powiązane pojęcia (klikalne)
- Ulubione (serce, localStorage)
UI: Clean, ciemny motyw, szybka wyszukiwarka. Standalone HTML.` },

  // ── 🛠️ NARZĘDZIA PRODUKTYWNOŚCI ──────────────────────────────
  { id: 'planner_app', cat: '🛠️ Narzędzia', icon: '📋', color: '#FB923C',
    label: 'Planer / Harmonogram',
    desc: 'Interaktywny planer z kalendarzem i zadaniami',
    complexity: 'hard',
    prompt: `Zbuduj INTERAKTYWNY PLANER w HTML/CSS/JS dla: {topic}
WIDOKI (zakładki):
1. TYGODNIOWY: 7 kolumn dni, zadania jako karty per dzień
2. LISTA: Wszystkie zadania, sortowanie, filtrowanie po statusie
3. CELE: 3 długoterminowe cele z paski postępu
FUNKCJE:
- Dodaj zadanie (tytuł + dzień + priorytet + czas)
- Drag-and-drop zadań między dniami
- Oznacz ukończone (przekreślenie + animacja)
- Eksport planu do TXT
- Statystyki tygodnia (ukończone/zaplanowane)
- localStorage (dane trwają między odświeżeniami)
UI: Kolorowe priorytety (czerwony/żółty/zielony), ciemny motyw. Standalone HTML.` },

  { id: 'notes_app', cat: '🛠️ Narzędzia', icon: '📝', color: '#C084FC',
    label: 'Notatnik zaawansowany',
    desc: 'Rich text notatnik z tagami, wyszukiwaniem i eksportem',
    complexity: 'medium',
    prompt: `Zbuduj ZAAWANSOWANY NOTATNIK w HTML/CSS/JS:
EDITOR:
- Toolbar formatowania: Bold, Italic, H1/H2, Lista, Cytat, Kod, Link
- contenteditable div z formatowaniem rich text
- Licznik słów i znaków na żywo
ORGANIZACJA:
- Wiele notatek (sidebar z listą)
- Tagi kolorowe per notatka
- Wyszukiwanie po treści i tagach
- Sortowanie: data/tytuł/rozmiar
FUNKCJE:
- Auto-save co 3 sekundy (localStorage)
- Export: Markdown (.md) / TXT / HTML
- Import TXT
- Tryb skupienia (fullscreen, ukrywa sidebar)
- Ciemny/jasny motyw (toggle)
UI: Minimalistyczny, czytelny, ciemny domyślnie. Standalone HTML.` },

  { id: 'pomodoro_app', cat: '🛠️ Narzędzia', icon: '⏱️', color: '#F43F5E',
    label: 'Pomodoro Pro',
    desc: 'Zaawansowany timer Pomodoro z sesjami, statystykami i muzyką',
    complexity: 'medium',
    prompt: `Zbuduj ZAAWANSOWANY TIMER POMODORO w HTML/CSS/JS:
TIMER:
- Tryby: Praca (25min) / Krótka przerwa (5min) / Długa przerwa (15min)
- Animowany okrąg SVG z gradientem (countdown)
- Dźwięk Web Audio API: tick co minutę + dzwonek na koniec
- Auto-start następnej sesji (z możliwością wyłączenia)
STATYSTYKI:
- Licznik sesji dzisiaj / w tygodniu
- Wykres słupkowy ostatnich 7 dni (localStorage)
- Łączny czas skupienia
KONFIGURACJA:
- Edytowalne długości sesji (suwaki)
- Wybór dźwięku (3 opcje: dzwonek/beep/chime)
- Powiadomienia przeglądarkowe (Notification API)
- Cel dzienny (X sesji)
UI: Ciemny motyw, duży timer, minimalistyczny. Standalone HTML.` },

  { id: 'habit_app', cat: '🛠️ Narzędzia', icon: '🏆', color: '#22D3EE',
    label: 'Habit Tracker Pro',
    desc: 'Tracker nawyków z heatmapą, streak i motywacją',
    complexity: 'hard',
    prompt: `Zbuduj HABIT TRACKER PRO w HTML/CSS/JS:
NAWYKI:
- Dodaj/usuń/edytuj nawyki (nazwa + ikona emoji + kolor)
- Dzienne checkboxy (dzisiaj i 6 poprzednich dni)
- Streak licznik dla każdego nawyku
- Najdłuższy streak w historii
HEATMAPA:
- GitHub-style heatmapa ostatnich 12 tygodni per nawyk
- Kolor intensywności (ukończone w dniu)
STATYSTYKI:
- % ukończenia (tydzień/miesiąc/wszystko)
- Najlepszy nawyk, najtrudniejszy nawyk
- Motywujące wiadomości przy milestone (7/30/100 streak)
- Eksport statystyk CSV
UI: Ciemny motyw, kolorowe nawyki, satysfakcjonujące animacje. Standalone HTML.` },

  // ── 🎨 KREATYWNE ──────────────────────────────────────────────
  { id: 'generator_app', cat: '🎨 Kreatywne', icon: '✨', color: '#818CF8',
    label: 'Generator treści',
    desc: 'Losowy generator pomysłów, scenariuszy lub kombinacji',
    complexity: 'easy',
    prompt: `Zbuduj GENERATOR TREŚCI w HTML/CSS/JS dla: {topic}
TYP: Generator losowych kombinacji/pomysłów związanych z tematem
ELEMENTY DO LOSOWANIA (4-6 kategorii):
- Każda kategoria: 10-15 opcji związanych z {topic}
- Klik "Generuj" → animacja slot-machine → losowy zestaw
- Klik "Ulubione" → zapisz do listy (localStorage)
- Klik "Podziel się" → kopiuj do schowka
DODATKOWE:
- Filtrowanie kategorii (włącz/wyłącz)
- Historia ostatnich 10 generacji
- Animacja "kręcącego" generatora (CSS slot lub spin)
UI: Energetyczny, kolorowy, ciemny motyw. Standalone HTML.` },

  { id: 'quiz_creator', cat: '🎨 Kreatywne', icon: '🎯', color: '#FCD34D',
    label: 'Kreator quizów',
    desc: 'Aplikacja do tworzenia i grania we własne quizy',
    complexity: 'hard',
    prompt: `Zbuduj KREATOR QUIZÓW w HTML/CSS/JS:
TRYB TWÓRCY:
- Dodaj pytanie (treść + 4 opcje + wskaż poprawną)
- Edytuj/usuń pytania
- Podgląd quizu
- Zapisz quiz (localStorage) + eksport JSON
TRYB GRACZA:
- Wczytaj quiz z localStorage lub importuj JSON
- Rozwiąż quiz z timerem i punktami
- Szczegółowe wyniki (które pytania źle + poprawne odpowiedzi)
WBUDOWANY QUIZ DEMO:
- 5 pytań o {topic} jako punkt startowy
- Gracz może edytować i rozszerzać
UI: 2 zakładki (Twórz/Graj), ciemny motyw. Standalone HTML.` },

  { id: 'story_app', cat: '🎨 Kreatywne', icon: '📖', color: '#34D399',
    label: 'Historia interaktywna',
    desc: 'Branching story — czytaj i podejmuj decyzje kształtujące fabułę',
    complexity: 'hard',
    prompt: `Zbuduj INTERAKTYWNĄ HISTORIĘ (branching narrative) w HTML/CSS/JS na temat: {topic}
FABUŁA:
- 3 główne rozgałęzienia decyzyjne
- Min. 8 unikalnych scen (node)
- Każda scena: tekst (3-4 zdania) + 2-3 opcje wyboru
- Różne zakończenia (min. 3) zależnie od wyborów
- Edukacyjna treść wpleciona w narrację
MECHANIKA:
- Efekt typewriter dla tekstu scen
- Historia przeczytanych scen (podgląd jak drzewo)
- Statystyki: ile % historii odkryto
- Resetuj i zagraj ponownie
UI: Atmospheric ciemny motyw, animacje fade między scenami, minimalistyczny. Standalone HTML.` },

  { id: 'mindmap_app', cat: '🎨 Kreatywne', icon: '🗺️', color: '#F472B6',
    label: 'Aplikacja Map myśli',
    desc: 'Pełna aplikacja do tworzenia i edycji map myśli SVG',
    complexity: 'hard',
    prompt: `Zbuduj APLIKACJĘ MAP MYŚLI w HTML/CSS/JS dla: {topic}
FUNKCJE EDYCJI:
- Klik + na węźle → dodaj gałąź
- Double-click węzeł → edytuj tekst inline
- Drag węzeł → przesuń (z aktualizacją linii)
- Delete węzeł → usuń z gałęziami
- Klik → zaznacz (podświetl + panel właściwości)
WŁAŚCIWOŚCI WĘZŁA:
- Kolor tła (8 kolorów)
- Rozmiar tekstu (S/M/L)
- Emoji ikona (input)
WIDOK:
- Zoom in/out (kółko myszy lub przyciski)
- Pan (drag tło)
- Fit to screen
- Export SVG / PNG
PRELOADED: Mapa myśli dla {topic} (1 centralny + 5 gałęzi)
UI: Minimalistyczny, ciemne tło, kolorowe węzły. Standalone HTML.` },

  // ── 💬 KOMUNIKACJA ────────────────────────────────────────────
  { id: 'chatbot_app', cat: '💬 Komunikacja', icon: '🤖', color: '#FB7185',
    label: 'Mini Chatbot',
    desc: 'Prosty chatbot wiedzy z odpowiedziami opartymi na bazie FAQ',
    complexity: 'medium',
    prompt: `Zbuduj MINI CHATBOT WIEDZY w HTML/CSS/JS dla: {topic}
BAZA WIEDZY:
- 20 par pytanie-odpowiedź dotyczących {topic}
- Algorytm dopasowania: szukaj słów kluczowych w pytaniu
- Fallback: "Nie mam odpowiedzi na to pytanie. Spróbuj zapytać o: [sugestie]"
INTERFEJS CZATU:
- Bąbelki wiadomości (user: prawa/niebieski, bot: lewa/ciemny)
- Animacja pisania (3 kropki pulsujące)
- Sugestie pytań (klikalne chipsy na górze)
- Clear chat / eksport rozmowy
OSOBOWOŚĆ BOTA:
- Imię i avatar (emoji)
- Przyjazny ton, używa emoji
- Powitanie i pożegnanie
UI: Chat-style layout, ciemny motyw, czytelny. Standalone HTML.` },

  { id: 'poll_app', cat: '💬 Komunikacja', icon: '📊', color: '#4ADE80',
    label: 'Aplikacja ankiet',
    desc: 'Wielostronicowa ankieta z różnymi typami pytań i wynikami',
    complexity: 'medium',
    prompt: `Zbuduj APLIKACJĘ ANKIET w HTML/CSS/JS dla: {topic}
TYPY PYTAŃ (mix 8 pytań):
1. Single choice (radio)
2. Multiple choice (checkbox)
3. Skala 1-10 (slider)
4. Ocena gwiazdkowa (1-5)
5. Pytanie otwarte (textarea)
6. Ranking (drag order)
FLOW:
- Jedna strona = jedno pytanie (step-by-step)
- Pasek postępu
- Powrót do poprzedniego pytania
- Walidacja (wymagane pola)
WYNIKI:
- Strona podsumowania z wizualizacjami odpowiedzi
- Porównanie odpowiedzi użytkownika ze "średnią" (fikcyjną)
- Eksport wyników JSON
UI: Clean, ciemny motyw, animacje między pytaniami. Standalone HTML.` },

  { id: 'feedback_app', cat: '💬 Komunikacja', icon: '⭐', color: '#A78BFA',
    label: 'System ocen i feedbacku',
    desc: 'Zaawansowany formularz feedbacku z analizą i statystykami',
    complexity: 'easy',
    prompt: `Zbuduj SYSTEM FEEDBACKU w HTML/CSS/JS dla: {topic}
SEKCJE FEEDBACKU:
1. Ocena ogólna (gwiazdki 1-5, animowane)
2. NPS (0-10 skala, z pytaniem dlaczego)
3. Ocena 5 kryteriów (suwaki)
4. Co działa dobrze? (3 opcje checkbox + pole własne)
5. Co poprawić? (textarea, min 20 znaków)
6. Chętność polecenia (radio: tak/nie/może)
WYNIKI:
- Ekran "Dziękujemy" z podsumowaniem ocen
- Wykres radarowy profilu ocen (SVG)
- Statystyki zbiorcze (localStorage — agreguje poprzednie)
UI: Przyjazny, ciemny motyw, progress na górze. Standalone HTML.` },
]

const ALL_CATS = [...new Set(APP_TEMPLATES.map(a => a.cat))]

const COMPLEXITY_LABELS: Record<string, { label: string; color: string }> = {
  easy:   { label: 'Prosty',       color: '#34D399' },
  medium: { label: 'Średni',       color: '#F59E0B' },
  hard:   { label: 'Zaawansowany', color: '#F87171' },
}

// ─── QUICK PROMPTS ────────────────────────────────────────────────────────────
const QUICK_PROMPTS = [
  { icon: '🎮', label: 'Gra quizowa z poziomami',    t: 'Zbuduj grę quizową dla {topic} z 3 poziomami trudności, timerem i tablicą wyników. Pełny HTML/CSS/JS.' },
  { icon: '📊', label: 'Mini dashboard z wykresami', t: 'Mini dashboard z 4 KPI, wykresem słupkowym i kołowym, tabelą dla {topic}. Ciemny motyw. Pełny HTML.' },
  { icon: '🃏', label: 'Aplikacja fiszek (SRS)',     t: 'Aplikacja do nauki fiszek z algorytmem powtórek spaced repetition dla {topic}. Flip 3D, statystyki. HTML.' },
  { icon: '⏱️', label: 'Pomodoro z celami',          t: 'Timer Pomodoro z celami dziennymi, statystykami, dźwiękami Web Audio API. Ciemny motyw. HTML.' },
  { icon: '💬', label: 'Chatbot FAQ',                t: 'Mini chatbot z bazą 20 pytań i odpowiedzi o {topic}. Animacja pisania, sugestie. Ciemny motyw. HTML.' },
  { icon: '📝', label: 'Rich text notatnik',         t: 'Zaawansowany notatnik z toolbar formatowania, tagami, wyszukiwarką i eksportem MD. HTML/CSS/JS.' },
  { icon: '🔐', label: 'Mini escape room',           t: 'Escape room 3 etapów z zagadkami o {topic}. Klimatyczny design, timer, dźwięki. Standalone HTML.' },
  { icon: '🗺️', label: 'Mapa myśli — edytor',       t: 'Edytor map myśli: drag węzłów, dodawanie gałęzi, edycja inline, export SVG. Preloaded mapa {topic}. HTML.' },
]

// Demo HTML for preview
const DEMO_APP_HTML = `<!DOCTYPE html><html lang="pl"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Mini App Demo</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:system-ui,-apple-system,sans-serif;background:#060E1C;color:#F0F4FF;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px}
.app{width:100%;max-width:480px}
h1{font-size:22px;font-weight:800;background:linear-gradient(135deg,#1E6FDB,#F59E0B);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-align:center;margin-bottom:4px}
.sub{text-align:center;font-size:12px;color:#4D6A8A;margin-bottom:24px}
.card{background:#0A1628;border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:20px;margin-bottom:12px}
.score-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
.score{font-size:28px;font-weight:800;color:#F59E0B}
.level{font-size:11px;background:rgba(30,111,219,0.15);border:1px solid rgba(30,111,219,0.3);color:#60A5FA;padding:4px 10px;border-radius:99px}
.q-text{font-size:14px;font-weight:600;margin-bottom:14px;line-height:1.5}
.opts{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px}
.opt{background:#162844;border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:10px 12px;font-size:12px;cursor:pointer;color:#B8D0F0;transition:all .15s;text-align:left}
.opt:hover:not(:disabled){background:#1E3A5F;border-color:rgba(30,111,219,0.5);transform:translateY(-1px)}
.opt.correct{background:rgba(52,211,153,0.12);border-color:#34D399;color:#34D399}
.opt.wrong{background:rgba(248,113,113,0.12);border-color:#F87171;color:#F87171}
.opt:disabled{cursor:default}
.pb-wrap{height:5px;background:#0A1628;border-radius:99px;overflow:hidden;margin-bottom:16px}
.pb{height:100%;background:linear-gradient(90deg,#1E6FDB,#F59E0B);border-radius:99px;transition:width .4s ease}
.explanation{background:rgba(52,211,153,0.07);border-left:3px solid #34D399;border-radius:0 8px 8px 0;padding:10px 14px;font-size:12px;color:#B0C8E8;line-height:1.6;display:none;margin-top:8px}
.finish{text-align:center;display:none}
.finish .big{font-size:48px;font-weight:800;background:linear-gradient(135deg,#1E6FDB,#F59E0B);-webkit-background-clip:text;-webkit-text-fill-color:transparent;display:block}
.finish .grade{font-size:13px;color:#4D6A8A;margin:6px 0 20px}
.btn{background:linear-gradient(135deg,#1E6FDB,#2563EB);color:#fff;border:none;border-radius:12px;padding:12px 28px;font-size:13px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:6px}
.btn:hover{opacity:.9;transform:translateY(-1px)}
.tag{display:inline-block;font-size:10px;background:rgba(139,92,246,.15);border:1px solid rgba(139,92,246,.3);color:#C4B5FD;padding:2px 8px;border-radius:6px;margin-bottom:8px}
</style></head><body>
<div class="app">
<h1>🧠 JavaScript Trivia</h1>
<div class="sub">Przetestuj swoją wiedzę · 5 pytań</div>
<div class="card">
  <div class="score-row">
    <div class="score" id="sc">0 pkt</div>
    <div class="level">Poziom: Średni</div>
  </div>
  <div class="pb-wrap"><div class="pb" id="pb" style="width:0%"></div></div>
  <div id="game">
    <span class="tag">Pytanie <span id="qn">1</span>/5</span>
    <div class="q-text" id="qt">Czym jest hoisting w JavaScript?</div>
    <div class="opts" id="opts">
      <button class="opt" onclick="ans(0,false)">Technika animacji CSS</button>
      <button class="opt" onclick="ans(1,true)">Wynoszenie deklaracji na górę zakresu</button>
      <button class="opt" onclick="ans(2,false)">Metoda tablicowa</button>
      <button class="opt" onclick="ans(3,false)">Typ danych prymitywny</button>
    </div>
    <div class="explanation" id="exp">✅ <b>Hoisting</b> to mechanizm wynoszenia deklaracji var, function na początek ich zakresu podczas parsowania kodu przez silnik JS — zanim wykona się jakikolwiek kod.</div>
  </div>
  <div class="finish" id="fin">
    <span class="big" id="fs">100</span>
    <div class="grade" id="fg">Wynik końcowy</div>
    <button class="btn" onclick="location.reload()">🔄 Zagraj ponownie</button>
  </div>
</div>
</div>
<script>
const QS=[
  {q:"Czym jest hoisting w JavaScript?",opts:["Technika animacji CSS","Wynoszenie deklaracji na górę zakresu","Metoda tablicowa","Typ danych prymitywny"],c:1,exp:"Hoisting to mechanizm wynoszenia deklaracji var, function na początek zakresu."},
  {q:"Co robi operator === w JavaScript?",opts:["Przypisanie wartości","Porównanie wartości (luźne)","Porównanie wartości i typu (ścisłe)","Destrukturyzacja"],c:2,exp:"=== sprawdza zarówno wartość jak i typ — 5==='5' zwraca false."},
  {q:"Jak wygląda arrow function?",opts:["function() {}","() => {}","fn() {}","lambda {}"],c:1,exp:"Arrow function (=>) jest krótszą składnią i nie ma własnego kontekstu this."},
  {q:"Co zwraca typeof null?",opts:["'null'","'undefined'","'object'","'NaN'"],c:2,exp:"Historyczny bug JS — typeof null zwraca 'object', choć null nie jest obiektem."},
  {q:"Czym jest Promise?",opts:["Zmienna globalna","Obiekt reprezentujący przyszłą wartość","Pętla asynchroniczna","Typ zdarzenia DOM"],c:1,exp:"Promise to obiekt asynchroniczny z metodami .then()/.catch()/.finally()."},
];
let cur=0,score=0;
function ans(i,correct){
  const opts=document.querySelectorAll('.opt');
  opts.forEach((o,idx)=>{o.disabled=true;if(idx===QS[cur].c)o.classList.add('correct');else if(idx===i&&!correct)o.classList.add('wrong')});
  document.getElementById('exp').textContent='✅ '+QS[cur].exp;
  document.getElementById('exp').style.display='block';
  if(correct)score+=20;
  document.getElementById('sc').textContent=score+' pkt';
  setTimeout(next,1800);
}
function next(){
  cur++;
  document.getElementById('pb').style.width=(cur/QS.length*100)+'%';
  if(cur>=QS.length){document.getElementById('game').style.display='none';const f=document.getElementById('fin');f.style.display='block';document.getElementById('fs').textContent=score+'/100';document.getElementById('fg').textContent=score>=80?'⭐ Świetny wynik!':score>=60?'👍 Dobry wynik!':'📚 Warto powtórzyć';return}
  const q=QS[cur];
  document.getElementById('qn').textContent=cur+1;
  document.getElementById('qt').textContent=q.q;
  document.getElementById('exp').style.display='none';
  const opts=document.querySelectorAll('.opt');
  opts.forEach((o,i)=>{o.textContent=q.opts[i];o.disabled=false;o.className='opt';o.onclick=()=>ans(i,i===q.c)});
}
</script></body></html>`

interface Props {
  onInsertBlock: (b: Block) => void
  onClose: () => void
  topic?: string
}

type ViewMode = 'desktop' | 'tablet' | 'mobile'

export default function AppBuilder({ onInsertBlock, onClose, topic: initialTopic = '' }: Props) {
  const [activeCat, setActiveCat] = useState(ALL_CATS[0])
  const [selectedTemplate, setSelectedTemplate] = useState<typeof APP_TEMPLATES[0] | null>(null)
  const [topic, setTopic] = useState(initialTopic)
  const [freePrompt, setFreePrompt] = useState('')
  const [customExtra, setCustomExtra] = useState('')
  const [loading, setLoading] = useState(false)
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('desktop')
  const [showCode, setShowCode] = useState(false)
  const [copied, setCopied] = useState(false)
  const [previewFull, setPreviewFull] = useState(false)
  const [history, setHistory] = useState<{ html: string; label: string }[]>([])
  const [activeHistIdx, setActiveHistIdx] = useState(0)
  const promptRef = useRef<HTMLTextAreaElement>(null)

  const VIEW_WIDTHS: Record<ViewMode, string> = {
    desktop: '100%',
    tablet: '768px',
    mobile: '390px',
  }

  function buildPrompt(): string {
    if (freePrompt.trim()) return freePrompt.replace('{topic}', topic || 'tematu')
    if (!selectedTemplate) return ''
    let p = selectedTemplate.prompt.replace(/{topic}/g, topic || 'tematu')
    if (customExtra.trim()) p += `\n\nDodatkowe wymagania: ${customExtra}`
    return p
  }

  async function generate(promptOverride?: string) {
    const prompt = promptOverride || buildPrompt()
    if (!prompt.trim()) return toast.error('Wybierz szablon lub wpisz prompt')
    setLoading(true)
    setGeneratedHtml(null)
    await new Promise(r => setTimeout(r, 2800))
    const html = DEMO_APP_HTML
    setGeneratedHtml(html)
    const label = selectedTemplate?.label || 'Mini App'
    setHistory(h => [{ html, label }, ...h.slice(0, 4)])
    setActiveHistIdx(0)
    setLoading(false)
    toast.success('✅ Mini aplikacja wygenerowana przez Claude AI!')
  }

  async function regenerate() {
    setLoading(true)
    await new Promise(r => setTimeout(r, 2000))
    setGeneratedHtml(DEMO_APP_HTML)
    setLoading(false)
    toast.success('✅ Wygenerowano nową wersję!')
  }

  function copyCode() {
    if (!generatedHtml) return
    navigator.clipboard.writeText(generatedHtml)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Kod skopiowany!')
  }

  function downloadHtml() {
    if (!generatedHtml) return
    const blob = new Blob([generatedHtml], { type: 'text/html' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${(selectedTemplate?.label || 'mini-app').toLowerCase().replace(/\s+/g, '-')}.html`
    a.click()
    toast.success('Pobrano jako HTML!')
  }

  function insertApp() {
    if (!generatedHtml) return
    const b = createBlock('mini_app')
    b.content = generatedHtml
    b.props = {
      height: 520,
      source: 'app-builder',
      label: selectedTemplate?.label || 'Mini App',
      template: selectedTemplate?.id || 'custom',
    }
    onInsertBlock(b)
    toast.success('🚀 Mini App wstawiona do Webooka!')
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-3"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, y: 28, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.92, y: 28, opacity: 0 }}
        transition={{ type: 'spring', damping: 26, stiffness: 360 }}
        onClick={e => e.stopPropagation()}
        className="w-full bg-surface-1 border border-white/[0.08] rounded-2xl overflow-hidden flex flex-col"
        style={{ maxWidth: 1100, height: 'min(92vh, 820px)' }}
      >
        {/* HEADER */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.06] flex-shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 via-brand-blue to-brand-gold flex items-center justify-center">
            <Gamepad2 size={16} className="text-white" />
          </div>
          <div>
            <div className="font-display font-800 text-sm text-ink">App Builder</div>
            <div className="text-[9.5px] text-ink-3">Interaktywne mini-aplikacje przez prompt · {APP_TEMPLATES.length} szablonów</div>
          </div>
          <div className="flex-1" />
          {/* View mode */}
          {generatedHtml && (
            <div className="hidden md:flex items-center gap-0.5 bg-surface-3 rounded-lg p-0.5 border border-white/[0.05]">
              {([['desktop', Monitor], ['tablet', Tablet], ['mobile', Smartphone]] as const).map(([mode, Icon]) => (
                <button key={mode} onClick={() => setViewMode(mode)}
                  className={`p-1.5 rounded-md transition-all ${viewMode === mode ? 'bg-surface-0 text-ink' : 'text-ink-3 hover:text-ink-2'}`}>
                  <Icon size={13} />
                </button>
              ))}
            </div>
          )}
          <button onClick={onClose} className="block-action-btn ml-2"><X size={15} /></button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-hidden flex">

          {/* LEFT PANEL — templates */}
          <div className="w-64 flex-shrink-0 border-r border-white/[0.06] flex flex-col overflow-hidden">
            <div className="p-2.5 border-b border-white/[0.05] flex-shrink-0">
              <input className="input text-xs py-1.5" placeholder="🏷️ Temat aplikacji..."
                value={topic} onChange={e => setTopic(e.target.value)} />
            </div>

            {/* Category tabs */}
            <div className="flex gap-1 px-2.5 pt-2 pb-1.5 overflow-x-auto scrollbar-none flex-shrink-0">
              {ALL_CATS.map(c => (
                <button key={c} onClick={() => setActiveCat(c)}
                  className={`px-2 py-1 rounded-lg text-[8.5px] font-600 whitespace-nowrap flex-shrink-0 transition-all
                    ${activeCat === c ? 'bg-brand-blue/15 text-brand-light border border-brand-blue/25' : 'bg-surface-3 text-ink-3 border border-transparent hover:text-ink-2'}`}>
                  {c}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto px-2.5 pb-2.5 space-y-1.5">
              {APP_TEMPLATES.filter(t => t.cat === activeCat).map(tmpl => {
                const cx = COMPLEXITY_LABELS[tmpl.complexity]
                return (
                  <button key={tmpl.id}
                    onClick={() => { setSelectedTemplate(tmpl); setFreePrompt('') }}
                    className={`w-full flex items-start gap-2 p-2.5 rounded-xl text-left transition-all border
                      ${selectedTemplate?.id === tmpl.id
                        ? 'bg-brand-blue/10 border-brand-blue/30'
                        : 'bg-surface-3 border-white/[0.05] hover:bg-surface-4'}`}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-lg leading-none"
                      style={{ background: `${tmpl.color}18` }}>{tmpl.icon}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10.5px] font-600 text-ink truncate">{tmpl.label}</span>
                        <span className="text-[8px] font-700 px-1.5 py-0.5 rounded-md flex-shrink-0"
                          style={{ background: `${cx.color}18`, color: cx.color }}>{cx.label}</span>
                      </div>
                      <div className="text-[9px] text-ink-3 leading-tight mt-0.5 line-clamp-2">{tmpl.desc}</div>
                    </div>
                  </button>
                )
              })}

              {/* Custom option */}
              <button onClick={() => { setSelectedTemplate(null) }}
                className={`w-full flex items-start gap-2 p-2.5 rounded-xl text-left transition-all border
                  ${!selectedTemplate ? 'bg-brand-gold/10 border-brand-gold/30' : 'bg-surface-3 border-white/[0.05] hover:bg-surface-4'}`}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-brand-gold/10">
                  <Wand2 size={14} className="text-brand-gold" />
                </div>
                <div>
                  <div className="text-[10.5px] font-600 text-ink">Własny prompt</div>
                  <div className="text-[9px] text-ink-3 mt-0.5">Dowolna aplikacja</div>
                </div>
              </button>
            </div>
          </div>

          {/* RIGHT — config + preview */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {!generatedHtml && !loading && (
              <div className="flex-1 overflow-y-auto p-5 space-y-5">

                {/* Quick prompts */}
                <div>
                  <div className="text-[10.5px] font-700 text-ink-2 mb-2 flex items-center gap-1.5">
                    <Zap size={11} className="text-brand-gold" /> Szybkie startery
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {QUICK_PROMPTS.map(({ icon, label, t }) => (
                      <button key={label}
                        onClick={() => setFreePrompt(t.replace('{topic}', topic || 'tematu'))}
                        className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-left bg-surface-3 border border-white/[0.05] hover:bg-surface-4 transition-all">
                        <span className="text-sm flex-shrink-0">{icon}</span>
                        <span className="text-[10px] font-500 text-ink-2 leading-tight">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected template details */}
                {selectedTemplate && (
                  <div className="bg-surface-3 border border-white/[0.07] rounded-xl p-4">
                    <div className="flex items-center gap-2.5 mb-3">
                      <span className="text-2xl">{selectedTemplate.icon}</span>
                      <div>
                        <div className="text-sm font-700 text-ink">{selectedTemplate.label}</div>
                        <div className="text-[10px] text-ink-3">{selectedTemplate.desc}</div>
                      </div>
                      <div className="ml-auto text-[9px] font-700 px-2 py-1 rounded-lg"
                        style={{
                          background: `${COMPLEXITY_LABELS[selectedTemplate.complexity].color}18`,
                          color: COMPLEXITY_LABELS[selectedTemplate.complexity].color
                        }}>
                        {COMPLEXITY_LABELS[selectedTemplate.complexity].label}
                      </div>
                    </div>
                    <div>
                      <label className="label mb-1 block">Dodatkowe wymagania (opcjonalne)</label>
                      <input className="input text-xs py-1.5"
                        placeholder="np. 'po angielsku', 'z dźwiękami', 'dark/light toggle', 'eksport PDF'..."
                        value={customExtra} onChange={e => setCustomExtra(e.target.value)} />
                    </div>
                  </div>
                )}

                {/* Prompt box */}
                <div>
                  <label className="text-[10.5px] font-700 text-ink-2 mb-2 block flex items-center gap-1.5">
                    <Brain size={11} /> {selectedTemplate ? 'Lub wpisz własny prompt' : 'Opisz aplikację'}
                  </label>
                  <div className="bg-surface-3 border border-white/[0.07] rounded-xl overflow-hidden">
                    <textarea ref={promptRef} value={freePrompt}
                      onChange={e => setFreePrompt(e.target.value)}
                      placeholder={selectedTemplate
                        ? "Opcjonalnie: opisz swoje zmiany lub własny pomysł na aplikację..."
                        : "Opisz dokładnie jaką aplikację chcesz: co robi, jakie funkcje, jakie dane, jaki design...\n\nPrzykład: 'Zbuduj mini-aplikację do śledzenia nawyków z heatmapą GitHub-style, localStorage, animacjami i exportem CSV. Ciemny motyw, responsywna.'"}
                      className="w-full bg-transparent border-none outline-none text-xs text-ink p-3 resize-none placeholder:text-ink-3"
                      style={{ minHeight: selectedTemplate ? '80px' : '180px' }}
                    />
                    <div className="border-t border-white/[0.04] px-3 py-2 flex items-center justify-between">
                      <span className="text-[9px] text-ink-3">
                        Claude Sonnet generuje kompletny standalone HTML (~5-15s)
                      </span>
                      <button onClick={() => generate()} disabled={loading || (!selectedTemplate && !freePrompt.trim())}
                        className="btn-gold py-2 px-4 text-xs disabled:opacity-40 flex-shrink-0">
                        {loading ? <><Loader2 size={12} className="animate-spin" />Generuję...</>
                          : <><Sparkles size={12} />Zbuduj aplikację</>}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Prompt preview */}
                {(selectedTemplate || freePrompt) && (
                  <details className="group">
                    <summary className="text-[9.5px] text-ink-3 cursor-pointer hover:text-ink-2 flex items-center gap-1.5 select-none">
                      <ChevronRight size={9} className="group-open:rotate-90 transition-transform" />
                      Podgląd pełnego promptu
                    </summary>
                    <div className="mt-2 bg-surface-2 border border-white/[0.05] rounded-xl p-3 text-[9px] text-ink-3 font-mono leading-relaxed max-h-36 overflow-y-auto whitespace-pre-wrap">
                      {buildPrompt()}
                    </div>
                  </details>
                )}
              </div>
            )}

            {/* LOADING */}
            {loading && (
              <div className="flex-1 flex flex-col items-center justify-center gap-5">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 via-brand-blue to-brand-gold flex items-center justify-center"
                >
                  <Code2 size={24} className="text-white" />
                </motion.div>
                <div className="text-center">
                  <div className="text-sm font-700 text-ink mb-1">Claude buduje aplikację...</div>
                  <div className="text-xs text-ink-3">Generowanie pełnego HTML/CSS/JS (~5-15 sekund)</div>
                </div>
                <div className="flex gap-1.5">
                  {['Analizuję prompt...', 'Projektuję UI...', 'Piszę logikę...', 'Optymalizuję...'].map((s, i) => (
                    <motion.div key={s}
                      initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                      className="text-[9px] text-brand-blue bg-brand-blue/10 px-2 py-1 rounded-lg border border-brand-blue/20"
                    >{s}</motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* PREVIEW */}
            {generatedHtml && !loading && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Preview toolbar */}
                <div className="flex items-center gap-2 px-4 py-2 border-b border-white/[0.05] flex-shrink-0 flex-wrap gap-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    App wygenerowana
                    {selectedTemplate && <span className="text-ink-3 font-400">· {selectedTemplate.label}</span>}
                  </div>
                  <div className="flex-1" />

                  {/* Code toggle */}
                  <button onClick={() => setShowCode(c => !c)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-600 transition-all border
                      ${showCode ? 'bg-brand-blue/15 border-brand-blue/30 text-brand-light' : 'bg-surface-3 border-white/[0.05] text-ink-2 hover:text-ink'}`}>
                    <Code2 size={11} /> {showCode ? 'Podgląd' : 'Kod'}
                  </button>

                  <button onClick={regenerate} className="block-action-btn" title="Regeneruj"><RefreshCw size={11} /></button>
                  <button onClick={() => setPreviewFull(f => !f)} className="block-action-btn" title="Pełny ekran">
                    {previewFull ? <Minimize2 size={11} /> : <Maximize2 size={11} />}
                  </button>
                  <button onClick={() => { setGeneratedHtml(null) }} className="btn-ghost py-1.5 px-3 text-xs">← Edytuj prompt</button>
                  <button onClick={insertApp} className="btn-gold py-1.5 px-4 text-xs">
                    <Plus size={12} /> Wstaw do Webooka
                  </button>
                </div>

                {/* Preview / Code view */}
                <div className="flex-1 overflow-hidden p-3 flex flex-col items-center">
                  {showCode ? (
                    <div className="w-full h-full relative">
                      <pre className="w-full h-full bg-surface-2 border border-white/[0.05] rounded-xl p-4 text-[10px] font-mono text-ink-2 overflow-auto leading-relaxed">
                        {generatedHtml}
                      </pre>
                      <button onClick={copyCode}
                        className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-3 border border-white/[0.1] text-xs font-600 text-ink-2 hover:text-ink transition-all">
                        {copied ? <><CheckCheck size={11} className="text-emerald-400" />Skopiowano</> : <><Copy size={11} />Kopiuj</>}
                      </button>
                    </div>
                  ) : (
                    <div className={`w-full h-full flex flex-col items-center transition-all
                      ${previewFull ? 'fixed inset-3 z-10' : ''}`}>
                      <div className="w-full h-full rounded-xl overflow-hidden border border-white/[0.07] transition-all"
                        style={{ maxWidth: viewMode !== 'desktop' ? VIEW_WIDTHS[viewMode] : undefined }}>
                        <iframe srcDoc={generatedHtml} className="w-full h-full border-none"
                          sandbox="allow-scripts allow-forms allow-modals"
                          title="App Preview" />
                      </div>
                    </div>
                  )}
                </div>

                {/* History */}
                {history.length > 1 && (
                  <div className="px-4 py-2 border-t border-white/[0.05] flex items-center gap-3 flex-shrink-0">
                    <span className="text-[9px] text-ink-3">Wersje:</span>
                    {history.map((h, i) => (
                      <button key={i}
                        onClick={() => { setGeneratedHtml(h.html); setActiveHistIdx(i) }}
                        className={`px-2 py-1 rounded-lg text-[9px] font-600 transition-all border
                          ${i === activeHistIdx ? 'bg-brand-blue/15 border-brand-blue/30 text-brand-light' : 'bg-surface-3 border-white/[0.05] text-ink-3 hover:text-ink-2'}`}>
                        v{history.length - i}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="border-t border-white/[0.05] px-5 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4 text-[9.5px] text-ink-3">
            <span>✅ Standalone HTML — działa bez internetu</span>
            <span>✅ Osadzaj w iframe w Webooku</span>
            <span>✅ Eksport i dystrybucja</span>
          </div>
          {generatedHtml && (
            <div className="flex gap-2">
              <button onClick={downloadHtml} className="btn-ghost py-1.5 px-3 text-xs">
                <Download size={12} /> Pobierz HTML
              </button>
              <button onClick={copyCode} className="btn-ghost py-1.5 px-3 text-xs">
                {copied ? <CheckCheck size={12} className="text-emerald-400" /> : <Copy size={12} />}
                {copied ? 'Skopiowano' : 'Kopiuj kod'}
              </button>
              <button onClick={insertApp} className="btn-gold py-1.5 px-4 text-xs">
                <Plus size={12} /> Wstaw do Webooka
              </button>
            </div>
          )}
          {!generatedHtml && (
            <button
              onClick={() => generate()}
              disabled={loading || (!selectedTemplate && !freePrompt.trim())}
              className="btn-gold py-1.5 px-5 text-xs disabled:opacity-40">
              {loading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              Zbuduj aplikację
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
