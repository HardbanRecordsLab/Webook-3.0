// ═══════════════════════════════════════════════════════════════════════
// WEBOOK STUDIO 4.0 — WORKSHEET BUILDER
// Kreator kart pracy i interaktywów przez prompt
// 20 typów kart | Podgląd live | Wstaw do Webooka | Eksport standalone
// ═══════════════════════════════════════════════════════════════════════
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Sparkles, Loader2, Plus, Copy, Download, RefreshCw,
  ChevronRight, ChevronDown, Eye, EyeOff, Maximize2,
  Wand2, Send, CheckCircle, AlertCircle, Layers,
  BookOpen, Brain, Gamepad2, Calculator, BarChart2,
  PenTool, ClipboardList, Zap, Target, Star
} from 'lucide-react'
import { toast } from 'sonner'
import type { Block } from '../../lib/blocks'
import { createBlock } from '../../lib/blocks'

// ─── 20 TYPÓW KART PRACY ─────────────────────────────────────────────────────
const CARD_TYPES = [
  // ── QUIZY I TESTY ─────────────────────────────────────────────
  {
    id: 'quiz_mc',
    cat: 'Quizy i testy',
    icon: '❓',
    color: '#F59E0B',
    label: 'Quiz wielokrotny wybór',
    desc: '4 opcje na pytanie, jedna poprawna, wyjaśnienia po odpowiedzi',
    template: `Stwórz kartę pracy: QUIZ wielokrotnego wyboru.
Temat: {topic}
Liczba pytań: {count|8}
Każde pytanie:
- Treść pytania
- 4 opcje odpowiedzi (A, B, C, D)
- Jedna poprawna (oznaczona)
- Wyjaśnienie dlaczego ta odpowiedź jest poprawna (2 zdania)
Styl: wyraźne pytania, realistic dystractors
Trudność: {difficulty|średnia}
Interfejs: sprawdzaj po każdym pytaniu, pokaż postęp, wynik końcowy z % i oceną słowną.
Ciemny motyw #060E1C, akcent niebieski #1E6FDB, złoty #F59E0B.
Pełny HTML z embedded CSS i JS, bez zewnętrznych bibliotek.`,
  },
  {
    id: 'quiz_tf',
    cat: 'Quizy i testy',
    icon: '✔️',
    color: '#10B981',
    label: 'Prawda / Fałsz',
    desc: '10 twierdzeń — zaznacz prawda lub fałsz z wyjaśnieniem',
    template: `Stwórz kartę pracy: PRAWDA / FAŁSZ.
Temat: {topic}
Liczba twierdzeń: {count|10}
Każde twierdzenie:
- Krótkie, jednoznaczne stwierdzenie
- Odpowiedź: Prawda lub Fałsz
- Po kliknięciu: kolorowe wyjaśnienie (zielony=prawda, czerwony=fałsz)
- 1-2 zdania uzasadnienia
Interfejs: duże przyciski P/F, animacja odpowiedzi, wynik końcowy.
Ciemny motyw #060E1C, animacje, responsywny.`,
  },
  {
    id: 'quiz_open',
    cat: 'Quizy i testy',
    icon: '✏️',
    color: '#8B5CF6',
    label: 'Pytania otwarte',
    desc: 'Pytania refleksyjne z polem do wpisania odpowiedzi i wzorcem',
    template: `Stwórz kartę pracy: PYTANIA OTWARTE z modelową odpowiedzią.
Temat: {topic}
Liczba pytań: {count|5}
Każde pytanie:
- Pytanie wymagające przemyślanej odpowiedzi (nie tak/nie)
- Obszerne pole textarea do wpisania
- Przycisk "Pokaż modelową odpowiedź" (ukryta do kliknięcia)
- Modelowa odpowiedź: 3-5 zdań kluczowych punktów
- Licznik słów w polu odpowiedzi
Interfejs: numeracja pytań, pasek postępu, eksport odpowiedzi do TXT.
Ciemny motyw #060E1C.`,
  },
  {
    id: 'fill_blanks',
    cat: 'Quizy i testy',
    icon: '📝',
    color: '#06B6D4',
    label: 'Uzupełnij luki',
    desc: 'Zdania z brakującymi słowami — wpisz lub wybierz z listy',
    template: `Stwórz kartę pracy: UZUPEŁNIANIE LUK.
Temat: {topic}
Tryb: {mode|wpisywanie} (wpisywanie / wybór z listy / drag-drop słów)
Liczba zdań: {count|8}
Każde zdanie:
- Edukacyjne zdanie z 1-3 lukami oznaczonymi ___
- Luki to kluczowe terminy z tematu
- Po wpisaniu: natychmiastowy feedback (zielony/czerwony)
- Podpowiedź po 2 nieudanych próbach
Opcjonalnie: bank słów do użycia (shuffle)
Interfejs: elegancki, inline inputs, podsumowanie błędów.
Ciemny motyw #060E1C, akcent niebieski.`,
  },
  {
    id: 'matching',
    cat: 'Quizy i testy',
    icon: '🔗',
    color: '#F97316',
    label: 'Dopasuj pary',
    desc: 'Połącz pojęcia z definicjami kliknięciem lub linią',
    template: `Stwórz kartę pracy: DOPASOWYWANIE PAR.
Temat: {topic}
Liczba par: {count|8}
Tryb: kliknij lewą kartę, potem prawą — tworzy połączenie
Zawartość par:
- Lewa kolumna: terminy/pojęcia/obrazki-emoji
- Prawa kolumna: definicje/wyjaśnienia/odpowiedniki
- Pomieszana kolejność prawej kolumny
Po dopasowaniu: kolorowy feedback (zielony=dobrze, czerwony=źle)
Animacja linii łączącej pary lub kolorowanie kart.
Wynik: X/Y poprawnych par.
Ciemny motyw #060E1C.`,
  },

  // ── ĆWICZENIA INTERAKTYWNE ────────────────────────────────────
  {
    id: 'sorting',
    cat: 'Ćwiczenia',
    icon: '🔀',
    color: '#EC4899',
    label: 'Sortowanie / kolejność',
    desc: 'Ułóż elementy w poprawnej kolejności klikając lub przeciągając',
    template: `Stwórz kartę pracy: SORTOWANIE / PORZĄDKOWANIE.
Temat: {topic}
Liczba elementów: {count|6}
Elementy do posortowania: {sort_type|chronologicznie} (chronologicznie / według ważności / logicznie / alfabetycznie)
Każdy element: krótka etykieta (3-6 słów)
Interfejs:
- Karty w losowej kolejności do kliknięcia w odpowiedniej sekwencji
- LUB numeryczne pola do wpisania kolejności
- Po sprawdzeniu: animacja reorganizacji do poprawnej kolejności
- Wyjaśnienie dlaczego taka kolejność
Ciemny motyw #060E1C, animacje.`,
  },
  {
    id: 'categorize',
    cat: 'Ćwiczenia',
    icon: '🗂️',
    color: '#3B82F6',
    label: 'Kategoryzowanie',
    desc: 'Przeciągnij elementy do właściwych kategorii',
    template: `Stwórz kartę pracy: KATEGORYZOWANIE.
Temat: {topic}
Liczba kategorii: {cats|3}
Elementy do posortowania: {count|12}
Interfejs:
- Górny panel: pool elementów (karty z etykietami/emoji)
- Dolny panel: {cats|3} strefy Drop oznaczone nazwą kategorii
- Drag-and-drop elementów do stref
- Alternatywa: klik element → klik strefa
- Po sprawdzeniu: podświetl błędne na czerwono, poprawne na zielono
- Wyjaśnienie do każdej kategorii
Ciemny motyw, kolorowe strefy.`,
  },
  {
    id: 'timeline',
    cat: 'Ćwiczenia',
    icon: '📅',
    color: '#14B8A6',
    label: 'Oś czasu — układanka',
    desc: 'Ułóż wydarzenia na osi czasu w poprawnej kolejności',
    template: `Stwórz kartę pracy: OŚ CZASU — INTERAKTYWNA.
Temat: {topic}
Liczba wydarzeń: {count|6}
Każde wydarzenie: data/rok + krótki opis (1 zdanie)
Interfejs:
- Pionowa lub pozioma oś czasu
- Karty wydarzeń wymieszane obok osi
- Kliknij kartę → kliknij slot na osi by umieścić
- Po sprawdzeniu: kolory poprawności + animacja ustawienia
- Kliknięcie umieszczonego wydarzenia: pełny opis w tooltip/modal
Ciemny motyw #060E1C, gradient niebieski.`,
  },
  {
    id: 'labeling',
    cat: 'Ćwiczenia',
    icon: '🏷️',
    color: '#A855F7',
    label: 'Podpisywanie diagramu',
    desc: 'Przeciągnij etykiety do właściwych miejsc na schemacie',
    template: `Stwórz kartę pracy: PODPISYWANIE SCHEMATU/DIAGRAMU.
Temat: {topic}
Stwórz ASCII-art lub SVG prosty diagram/schemat związany z tematem.
Liczba elementów do podpisania: {count|6}
Interfejs:
- Diagram z ponumerowanymi punktami (1, 2, 3...)
- Lista etykiet/nazw obok do przypisania
- Dropdown lub drag do każdego numeru
- Po sprawdzeniu: nazwy na odpowiednich miejscach
- Wyjaśnienia po poprawnym rozwiązaniu
Ciemny motyw #060E1C.`,
  },
  {
    id: 'memory',
    cat: 'Ćwiczenia',
    icon: '🧠',
    color: '#EF4444',
    label: 'Memory — pary kart',
    desc: 'Gra pamięciowa dopasowania par pojęć lub obrazków',
    template: `Stwórz kartę pracy: MEMORY — GRA PAMIĘCIOWA.
Temat: {topic}
Liczba par: {count|8} (= {count|8}×2 = {count16|16} kart)
Typy par: termin ↔ definicja LUB pojęcie ↔ przykład LUB obraz-emoji ↔ nazwa
Interfejs:
- Siatka kart odwróconych tyłem
- Kliknij 2 karty — jeśli para: zostają odkryte (zielone)
- Jeśli nie — wracają tyłem (animacja flip CSS 3D)
- Licznik: par znalezionych / czas / ruchy
- Po ukończeniu: ekran wyników z oceną
Ciemny motyw #060E1C, animacje flip 3D.`,
  },

  // ── KALKULATORY I NARZĘDZIA ───────────────────────────────────
  {
    id: 'calculator',
    cat: 'Kalkulatory',
    icon: '🧮',
    color: '#22D3EE',
    label: 'Kalkulator tematyczny',
    desc: 'Własny kalkulator z logiką i polami związanymi z tematem',
    template: `Stwórz kartę pracy: KALKULATOR TEMATYCZNY.
Temat/zastosowanie: {topic}
Stwórz kalkulator który:
- Ma {fields|3-5} pól wejściowych związanych z tematem
- Przelicza wynik na podstawie wzoru/logiki tematycznej
- Pokazuje wynik z jednostkami i interpretacją
- Wyjaśnia wzór w seksji "Jak to działa?"
- Ma przykładowe wartości / sugestie
- Responsywny layout z etykietami i placeholderami
Ciemny motyw #060E1C, akcent #1E6FDB, animowane pole wyniku.`,
  },
  {
    id: 'checklist_task',
    cat: 'Kalkulatory',
    icon: '✅',
    color: '#4ADE80',
    label: 'Checklista zadań',
    desc: 'Interaktywna lista kroków/zadań z postępem i możliwością edycji',
    template: `Stwórz kartę pracy: CHECKLISTA ZADAŃ/KROKÓW.
Temat: {topic}
Liczba pozycji: {count|10}
Każda pozycja:
- Checkbox (klikany)
- Tytuł zadania (edytowalny double-click)
- Opcjonalny krótki opis/wskazówka
- Priorytet (wysoki/średni/niski) z kolorem
Interfejs:
- Pasek postępu na górze (X/Y ukończonych)
- Animacja przy zaznaczeniu (confetti przy 100%)
- Filtry: Wszystkie / Do zrobienia / Ukończone
- Przycisk "Dodaj własne zadanie"
- Eksport do TXT/PDF
Ciemny motyw #060E1C.`,
  },
  {
    id: 'selfcheck',
    cat: 'Kalkulatory',
    icon: '🎯',
    color: '#FB923C',
    label: 'Samoocena kompetencji',
    desc: 'Oceniaj swoje umiejętności na skali z refleksją i planem',
    template: `Stwórz kartę pracy: SAMOOCENA KOMPETENCJI.
Temat/dziedzina: {topic}
Liczba kompetencji: {count|8}
Dla każdej kompetencji:
- Nazwa i opis (co dokładnie obejmuje)
- Suwak 1-5 lub 5 gwiazdek do oceny
- Label poziomu: Brak wiedzy / Podstawy / Średni / Zaawansowany / Ekspert
- Pole "Co zrobię by się poprawić?" (textarea)
Interfejs:
- Radar chart SVG pokazujący profil kompetencji
- Podsumowanie: mocne strony vs. do poprawy
- Przycisk "Zapisz / Drukuj raport"
Ciemny motyw #060E1C.`,
  },

  // ── KREATYWNE ─────────────────────────────────────────────────
  {
    id: 'mindmap',
    cat: 'Kreatywne',
    icon: '🗺️',
    color: '#F59E0B',
    label: 'Mapa myśli — interaktywna',
    desc: 'Rozbuduj mapę pojęć klikając gałęzie i dodając własne węzły',
    template: `Stwórz kartę pracy: INTERAKTYWNA MAPA MYŚLI.
Temat centralny: {topic}
Wygeneruj mapę myśli:
- Węzeł centralny: {topic}
- 5 głównych gałęzi (kluczowe aspekty/kategorie)
- 2-3 podgałęzie każdej gałęzi
Interfejs:
- SVG z węzłami i liniami krzywymi
- Kliknij węzeł by zobaczyć szczegóły w panelu bocznym
- Przycisk "Dodaj węzeł" przy każdej gałęzi
- Double-click na węzeł = edytuj tekst
- Kolory per gałąź, animacje hover
- Możliwość zwijania/rozwijania gałęzi
Ciemny motyw #060E1C, pastelowe kolory węzłów.`,
  },
  {
    id: 'reflection',
    cat: 'Kreatywne',
    icon: '💭',
    color: '#C084FC',
    label: 'Karta refleksji',
    desc: 'Ustrukturyzowana refleksja po lekcji — co wiem, co chcę wiedzieć',
    template: `Stwórz kartę pracy: KARTA REFLEKSJI.
Temat lekcji: {topic}
Typ refleksji: {type|KWL} (KWL / 3-2-1 / Exit Ticket / 5W / PMI)
Stwórz odpowiednią strukturę:
KWL: Co Wiem / Co chcę Wiedzieć / Czego się Nauczyłem
3-2-1: 3 rzeczy które się nauczyłem / 2 pytania / 1 zastosowanie
Exit Ticket: Najważniejszy wniosek / Pytanie / Ocena zrozumienia
Interfejs:
- Estetyczne sekcje z polami textarea
- Licznik słów w każdej sekcji (min. X słów)
- Pasek postępu wypełnienia
- Eksport jako PDF/TXT
- Opcja udostępnienia odpowiedzi
Ciemny motyw #060E1C.`,
  },
  {
    id: 'brainstorm',
    cat: 'Kreatywne',
    icon: '⚡',
    color: '#FBBF24',
    label: 'Burza mózgów',
    desc: 'Timer + noter do generowania i oceniania pomysłów',
    template: `Stwórz kartę pracy: BURZA MÓZGÓW.
Temat/problem: {topic}
Interfejs:
- Nagłówek z pytaniem/problemem do rozwiązania
- Timer odliczający (domyślnie 5 minut) — "Masz X minut na pomysły!"
- Duże pole do wpisywania pomysłów (Enter = nowy pomysł jako tag/chip)
- Lista wygenerowanych pomysłów z możliwością:
  * Oceń gwiazdkami (1-5)
  * Oznacz jako ulubiony (serce)
  * Usuń
  * Połącz z innym (przeciągnij)
- Po zakończeniu timera: widok "Top 3 pomysły"
- Eksport listy pomysłów
Ciemny motyw #060E1C, energetyczny design.`,
  },

  // ── WIZUALIZACJE DANYCH ───────────────────────────────────────
  {
    id: 'data_viz',
    cat: 'Wizualizacje',
    icon: '📊',
    color: '#38BDF8',
    label: 'Wykres interaktywny',
    desc: 'Edytowalny wykres z danymi — słupkowy, kołowy, liniowy',
    template: `Stwórz kartę pracy: INTERAKTYWNY WYKRES DANYCH.
Temat/dane: {topic}
Typ wykresu: {chart|słupkowy} (słupkowy / kołowy / liniowy / radarowy)
Wygeneruj realistyczne dane związane z tematem: {count|6-8} punktów danych
Interfejs:
- Wykres SVG w pełni animowany (ładowanie z animacją)
- Tabela edytowalna pod wykresem (zmień wartość → wykres się odświeża)
- Tooltip z wartością i % na hover
- Legenda klikalna (ukryj/pokaż serię)
- Tytuł i etykiety osi edytowalne
- Przycisk eksportu PNG (html2canvas polyfill)
Ciemny motyw #060E1C, gradient kolory.`,
  },
  {
    id: 'comparison_table',
    cat: 'Wizualizacje',
    icon: '⚖️',
    color: '#34D399',
    label: 'Tabela porównawcza',
    desc: 'Porównaj 2-4 opcje według wielu kryteriów z ocenami',
    template: `Stwórz kartę pracy: TABELA PORÓWNAWCZA.
Temat/opcje do porównania: {topic}
Liczba opcji: {options|3}
Liczba kryteriów: {criteria|6}
Interfejs:
- Header row: nazwy opcji z ikonami/emoji
- Wiersze: kryteria porównania
- Komórki: ✓/✗ LUB gwiazdki LUB wartości LUB edytowalne pola
- Sortowanie po kryterium (klik nagłówka)
- Podświetlanie "zwycięzcy" per kryterium (najlepsza wartość)
- Podsumowanie: ranking opcji + rekomendacja
- Drukuj/eksportuj tabelę
Ciemny motyw #060E1C.`,
  },
  {
    id: 'swot_card',
    cat: 'Wizualizacje',
    icon: '🔲',
    color: '#A78BFA',
    label: 'Macierz SWOT / analiza',
    desc: 'Interaktywna macierz z edytowalnymi polami i exportem',
    template: `Stwórz kartę pracy: MACIERZ ANALIZY SWOT.
Temat/podmiot analizy: {topic}
4 ćwiartki:
- Strengths (Mocne strony) — zielone tło
- Weaknesses (Słabości) — czerwone tło
- Opportunities (Szanse) — niebieskie tło
- Threats (Zagrożenia) — pomarańczowe tło
Każda ćwiartka zawiera 3 przykładowe punkty + możliwość dodania własnych
Interfejs:
- Kliknij punkt → edytuj tekst inline
- Przycisk "Dodaj punkt" w każdej ćwiartce
- Drag-and-drop punktów między ćwiartkami
- Eksport do PDF/PNG (window.print)
- Licznik punktów per ćwiartka
Ciemny motyw #060E1C.`,
  },
  {
    id: 'scenario',
    cat: 'Wizualizacje',
    icon: '🎭',
    color: '#FB7185',
    label: 'Scenariusz / case study',
    desc: 'Interaktywny case study z pytaniami i modelowymi odpowiedziami',
    template: `Stwórz kartę pracy: INTERAKTYWNY CASE STUDY.
Temat/scenariusz: {topic}
Struktura:
1. Opis sytuacji/przypadku (3-4 akapity, realistyczny)
2. Kluczowe dane i fakty (lista bullet)
3. Pytania do analizy ({count|4} pytań):
   - Treść pytania
   - Pole textarea do odpowiedzi
   - Przycisk "Modelowa odpowiedź" (ukryta)
   - Kryteria oceny dobrej odpowiedzi
4. Wnioski i rekomendacje (do uzupełnienia)
Interfejs:
- Sekcje z numeracją, estetyczny layout
- Pasek postępu analizy
- Timer opcjonalny (symulacja egzaminu)
Ciemny motyw #060E1C.`,
  },
]

const ALL_CATS = [...new Set(CARD_TYPES.map(c => c.cat))]

// ─── PROMPTY SZYBKIE ──────────────────────────────────────────────────────────
const QUICK_PROMPTS = [
  { icon: '⚡', label: 'Quiz 5 pytań',            t: 'quiz o {topic}, 5 pytań wielokrotnego wyboru, poziom średni' },
  { icon: '🃏', label: 'Fiszki 10 par',           t: 'fiszki 10 par termin↔definicja z tematu {topic}' },
  { icon: '✅', label: 'Checklista 8 kroków',      t: 'interaktywna checklista 8 kroków/zadań dotyczących {topic}' },
  { icon: '🔗', label: 'Dopasuj 6 par',           t: 'dopasowywanie 6 par pojęcie↔definicja z tematu {topic}' },
  { icon: '📊', label: 'Wykres z danymi',          t: 'interaktywny wykres słupkowy z 6 danymi na temat {topic}' },
  { icon: '💭', label: 'Karta refleksji KWL',      t: 'karta refleksji KWL (wiem/chcę wiedzieć/nauczyłem się) dla tematu {topic}' },
  { icon: '🧠', label: 'Memory 8 par',             t: 'gra memory 8 par kart: termin↔wyjaśnienie z tematu {topic}' },
  { icon: '⚖️', label: 'Porównanie 3 opcji',       t: 'tabela porównawcza 3 opcji/rozwiązań dotyczących {topic}, 5 kryteriów' },
  { icon: '🗂️', label: 'Kategoryzowanie',          t: 'kategoryzowanie 12 elementów do 3 grup z tematu {topic}' },
  { icon: '🎯', label: 'Samoocena 6 kompetencji', t: 'samoocena 6 kluczowych kompetencji z dziedziny {topic}' },
]

// Demo HTML zwracane zamiast prawdziwego API
const DEMO_CARDS: Record<string, string> = {
  default: `<!DOCTYPE html><html><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Karta pracy</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:system-ui,sans-serif;background:#060E1C;color:#F0F4FF;padding:24px;min-height:400px}
h1{font-size:20px;font-weight:800;margin-bottom:6px;background:linear-gradient(135deg,#1E6FDB,#F59E0B);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.sub{font-size:12px;color:#4D6A8A;margin-bottom:20px}
.progress-bar{height:6px;background:#0A1628;border-radius:99px;margin-bottom:20px;overflow:hidden}
.progress-fill{height:100%;background:linear-gradient(90deg,#1E6FDB,#F59E0B);border-radius:99px;transition:width .4s ease;width:0%}
.q{background:#0A1628;border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:18px;margin-bottom:12px}
.q-text{font-size:14px;font-weight:600;margin-bottom:14px;line-height:1.5}
.opts{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.opt{background:#162844;border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:10px 14px;font-size:13px;cursor:pointer;text-align:left;color:#B8D0F0;transition:all .15s;display:flex;align-items:center;gap:8px}
.opt:hover{background:#1E3A5F;border-color:rgba(30,111,219,0.4)}
.opt.correct{background:rgba(52,211,153,0.12);border-color:#34D399;color:#34D399}
.opt.wrong{background:rgba(248,113,113,0.12);border-color:#F87171;color:#F87171}
.opt .letter{width:22px;height:22px;border-radius:6px;background:rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0}
.explanation{margin-top:12px;padding:10px 14px;background:rgba(52,211,153,0.07);border-radius:10px;border-left:3px solid #34D399;font-size:12px;color:#B8D0F0;line-height:1.6;display:none}
.score-box{background:#0A1628;border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:24px;text-align:center;display:none}
.score-val{font-size:48px;font-weight:800;background:linear-gradient(135deg,#1E6FDB,#F59E0B);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.score-label{color:#4D6A8A;font-size:13px;margin-top:4px}
.btn{background:linear-gradient(135deg,#1E6FDB,#2563EB);color:#fff;border:none;border-radius:10px;padding:10px 24px;font-size:13px;font-weight:700;cursor:pointer;margin-top:16px}
.btn:hover{opacity:.9}
</style></head><body>
<h1>❓ Quiz: JavaScript ES6</h1>
<div class="sub">Karta pracy · 5 pytań · Sprawdź swoją wiedzę</div>
<div class="progress-bar"><div class="progress-fill" id="pb"></div></div>
<div id="quiz">
<div class="q" id="q0">
  <div class="q-text">1. Czym jest let w JavaScript ES6?</div>
  <div class="opts">
    <button class="opt" onclick="ans(0,0,false)"><span class="letter">A</span>Deklaracja stałej</button>
    <button class="opt" onclick="ans(0,1,true)"><span class="letter">B</span>Deklaracja zmiennej blokowej</button>
    <button class="opt" onclick="ans(0,2,false)"><span class="letter">C</span>Funkcja strzałkowa</button>
    <button class="opt" onclick="ans(0,3,false)"><span class="letter">D</span>Operator destrukturyzacji</button>
  </div>
  <div class="explanation" id="e0">✅ <b>let</b> wprowadza zmienną o zasięgu blokowym — widoczną tylko wewnątrz {} w którym została zadeklarowana. W odróżnieniu od var nie jest hoistowana do funkcji.</div>
</div>
<div class="q" id="q1" style="opacity:.4;pointer-events:none">
  <div class="q-text">2. Które wyrażenie to arrow function?</div>
  <div class="opts">
    <button class="opt" onclick="ans(1,0,false)"><span class="letter">A</span>function add(a,b){return a+b}</button>
    <button class="opt" onclick="ans(1,1,false)"><span class="letter">B</span>add = new Function('a,b','return a+b')</button>
    <button class="opt" onclick="ans(1,2,true)"><span class="letter">C</span>const add = (a,b) => a+b</button>
    <button class="opt" onclick="ans(1,3,false)"><span class="letter">D</span>let add = function(a,b){return a+b}</button>
  </div>
  <div class="explanation" id="e1">✅ <b>Arrow function</b> używa składni <code>=></code>. Krótsza i dziedziczy <code>this</code> z otaczającego kontekstu.</div>
</div>
</div>
<div class="score-box" id="score">
  <div class="score-val" id="sv">0/2</div>
  <div class="score-label">poprawnych odpowiedzi</div>
  <button class="btn" onclick="location.reload()">🔄 Spróbuj ponownie</button>
</div>
<script>
let answered=0,correct=0,total=2;
function ans(q,opt,isCorrect){
  const qEl=document.getElementById('q'+q);
  if(qEl.dataset.answered)return;
  qEl.dataset.answered='1';
  const opts=qEl.querySelectorAll('.opt');
  opts.forEach((o,i)=>{
    o.disabled=true;
    if(i===opt)o.classList.add(isCorrect?'correct':'wrong');
    if(!isCorrect){opts.forEach((oo,ii)=>{if(oo.onclick.toString().includes('true'))oo.classList.add('correct')})}
  });
  document.getElementById('e'+q).style.display='block';
  if(isCorrect)correct++;
  answered++;
  document.getElementById('pb').style.width=(answered/total*100)+'%';
  if(answered<total){const next=document.getElementById('q'+answered);if(next){next.style.opacity='1';next.style.pointerEvents='auto'}}
  else{setTimeout(()=>{document.getElementById('quiz').style.display='none';document.getElementById('score').style.display='block';document.getElementById('sv').textContent=correct+'/'+total},800)}
}
</script>
</body></html>`,
}

interface Props {
  onInsertBlock: (b: Block) => void
  onClose: () => void
  topic?: string
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function WorksheetBuilder({ onInsertBlock, onClose, topic: initialTopic = '' }: Props) {
  const [step, setStep] = useState<'pick' | 'configure' | 'preview'>('pick')
  const [selectedType, setSelectedType] = useState<typeof CARD_TYPES[0] | null>(null)
  const [activeCat, setActiveCat] = useState(ALL_CATS[0])
  const [topic, setTopic] = useState(initialTopic)
  const [customPrompt, setCustomPrompt] = useState('')
  const [freePrompt, setFreePrompt] = useState('')
  const [params, setParams] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null)
  const [previewFull, setPreviewFull] = useState(false)
  const [history, setHistory] = useState<string[]>([])
  const [activeQuickPrompt, setActiveQuickPrompt] = useState<string | null>(null)
  const promptRef = useRef<HTMLTextAreaElement>(null)

  // Build prompt with params
  function buildPrompt(): string {
    if (freePrompt.trim()) return freePrompt.replace('{topic}', topic || 'tematu lekcji')
    if (!selectedType) return ''
    let p = selectedType.template
    p = p.replace(/{topic}/g, topic || 'tematu lekcji')
    Object.entries(params).forEach(([k, v]) => {
      p = p.replace(new RegExp(`\\{${k}[^}]*\\}`, 'g'), v)
    })
    // Replace remaining {param|default} with defaults
    p = p.replace(/\{([^|{}]+)\|([^}]+)\}/g, '$2')
    if (customPrompt.trim()) p += `\n\nDodatkowe wymagania: ${customPrompt}`
    return p
  }

  async function generate() {
    const prompt = buildPrompt()
    if (!prompt && !activeQuickPrompt) return toast.error('Wpisz temat lub wybierz typ karty')
    setLoading(true)
    setGeneratedHtml(null)

    // Simulate API call (replace with real Claude API)
    await new Promise(r => setTimeout(r, 2500))

    const html = DEMO_CARDS.default
    setGeneratedHtml(html)
    setHistory(h => [html, ...h.slice(0, 4)])
    setStep('preview')
    setLoading(false)
    toast.success('✅ Karta pracy wygenerowana!')
  }

  async function regenerate() {
    setLoading(true)
    await new Promise(r => setTimeout(r, 1800))
    setGeneratedHtml(DEMO_CARDS.default)
    setLoading(false)
    toast.success('✅ Wygenerowano nową wersję!')
  }

  function insertIntoWebook() {
    if (!generatedHtml) return
    const b = createBlock('interactive_tool')
    b.content = generatedHtml
    b.props = {
      height: 480,
      source: 'worksheet-builder',
      cardType: selectedType?.id || 'custom',
      label: selectedType?.label || 'Karta pracy',
    }
    onInsertBlock(b)
    toast.success('🎉 Karta pracy wstawiona do Webooka!')
    onClose()
  }

  function useQuickPrompt(t: string) {
    const filled = t.replace('{topic}', topic || 'tematu lekcji')
    setFreePrompt(filled)
    setActiveQuickPrompt(t)
    setTimeout(() => promptRef.current?.focus(), 100)
  }

  // ── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.93, y: 24, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.93, y: 24, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 380 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-5xl bg-surface-1 border border-white/[0.07] rounded-2xl overflow-hidden flex flex-col"
        style={{ height: 'min(88vh, 780px)' }}
      >
        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-blue via-brand-gold to-brand-orange flex items-center justify-center">
              <Layers size={16} className="text-white" />
            </div>
            <div>
              <div className="font-display font-800 text-base text-ink">Kreator kart pracy</div>
              <div className="text-[10px] text-ink-3">20 typów interaktywów · generowanie przez Claude AI</div>
            </div>
          </div>

          {/* Steps */}
          <div className="hidden sm:flex items-center gap-2 text-xs">
            {(['pick', 'configure', 'preview'] as const).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-600 transition-all
                  ${step === s ? 'bg-brand-blue/15 text-brand-light border border-brand-blue/30' : 'text-ink-3'}`}>
                  <span className="w-4 h-4 rounded-full border text-[9px] flex items-center justify-center
                    border-current font-700">{i + 1}</span>
                  {s === 'pick' ? 'Typ karty' : s === 'configure' ? 'Konfiguruj' : 'Podgląd'}
                </div>
                {i < 2 && <ChevronRight size={12} className="text-ink-3" />}
              </div>
            ))}
          </div>

          <button onClick={onClose} className="block-action-btn"><X size={15} /></button>
        </div>

        {/* ── BODY ────────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-hidden flex">

          {/* LEFT: type picker / config */}
          <div className="w-72 flex-shrink-0 border-r border-white/[0.06] flex flex-col overflow-hidden">

            {/* Topic input */}
            <div className="p-3 border-b border-white/[0.05] flex-shrink-0">
              <label className="label mb-1.5 block">Temat / kontekst</label>
              <input
                className="input text-xs py-1.5"
                placeholder="np. JavaScript ES6, Fotosynteza, Marketing..."
                value={topic}
                onChange={e => setTopic(e.target.value)}
              />
            </div>

            {/* Category tabs */}
            <div className="flex gap-1 px-3 pt-2.5 overflow-x-auto scrollbar-none flex-shrink-0 pb-1.5">
              {ALL_CATS.map(c => (
                <button key={c} onClick={() => setActiveCat(c)}
                  className={`px-2 py-1 rounded-lg text-[9px] font-600 whitespace-nowrap flex-shrink-0 transition-all
                    ${activeCat === c
                      ? 'bg-brand-blue/15 text-brand-light border border-brand-blue/25'
                      : 'bg-surface-3 text-ink-3 border border-transparent hover:text-ink-2'}`}>
                  {c}
                </button>
              ))}
            </div>

            {/* Card type list */}
            <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1.5 pt-1.5">
              {CARD_TYPES.filter(c => c.cat === activeCat).map(type => (
                <button key={type.id}
                  onClick={() => { setSelectedType(type); setStep('configure'); setFreePrompt('') }}
                  className={`w-full flex items-start gap-2.5 p-2.5 rounded-xl text-left transition-all border
                    ${selectedType?.id === type.id
                      ? 'bg-brand-blue/10 border-brand-blue/30 shadow-sm'
                      : 'bg-surface-3 border-white/[0.05] hover:bg-surface-4 hover:border-white/10'}`}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-lg"
                    style={{ background: `${type.color}18` }}>
                    {type.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-600 text-ink leading-tight">{type.label}</div>
                    <div className="text-[9.5px] text-ink-3 mt-0.5 leading-tight">{type.desc}</div>
                  </div>
                </button>
              ))}

              {/* Free prompt option */}
              <button
                onClick={() => { setSelectedType(null); setStep('configure') }}
                className={`w-full flex items-start gap-2.5 p-2.5 rounded-xl text-left transition-all border
                  ${!selectedType && step === 'configure'
                    ? 'bg-brand-gold/10 border-brand-gold/30'
                    : 'bg-surface-3 border-white/[0.05] hover:bg-surface-4'}`}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-brand-gold/10">
                  <Wand2 size={15} className="text-brand-gold" />
                </div>
                <div>
                  <div className="text-[11px] font-600 text-ink">Własny prompt</div>
                  <div className="text-[9.5px] text-ink-3 mt-0.5">Dowolny typ karty pracy</div>
                </div>
              </button>
            </div>
          </div>

          {/* RIGHT: configure + preview */}
          <div className="flex-1 flex flex-col overflow-hidden">

            {/* CONFIGURE STEP */}
            {(step === 'pick' || step === 'configure') && (
              <div className="flex-1 overflow-y-auto p-5 space-y-5">

                {/* Quick prompts */}
                <div>
                  <div className="text-xs font-700 text-ink-2 mb-2 flex items-center gap-1.5">
                    <Zap size={11} className="text-brand-gold" /> Szybkie startery
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {QUICK_PROMPTS.map(({ icon, label, t }) => (
                      <button key={label}
                        onClick={() => useQuickPrompt(t)}
                        className={`flex items-center gap-2 px-2.5 py-2 rounded-xl text-left transition-all border text-[10.5px]
                          ${activeQuickPrompt === t
                            ? 'bg-brand-gold/10 border-brand-gold/30 text-ink'
                            : 'bg-surface-3 border-white/[0.05] hover:bg-surface-4 text-ink-2'}`}>
                        <span className="text-sm flex-shrink-0">{icon}</span>
                        <span className="font-500 leading-tight">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected type details */}
                {selectedType && (
                  <div className="bg-surface-3 border border-white/[0.06] rounded-xl p-4">
                    <div className="flex items-center gap-2.5 mb-3">
                      <span className="text-2xl">{selectedType.icon}</span>
                      <div>
                        <div className="text-sm font-700 text-ink">{selectedType.label}</div>
                        <div className="text-[10px] text-ink-3">{selectedType.desc}</div>
                      </div>
                    </div>

                    {/* Params */}
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { key: 'count', label: 'Liczba elementów', placeholder: '8', type: 'number' },
                        { key: 'difficulty', label: 'Trudność', placeholder: 'średnia', type: 'text' },
                      ].map(({ key, label, placeholder, type }) => (
                        <div key={key}>
                          <label className="label mb-1 block">{label}</label>
                          <input type={type} className="input text-xs py-1.5" placeholder={placeholder}
                            value={params[key] || ''}
                            onChange={e => setParams(p => ({ ...p, [key]: e.target.value }))} />
                        </div>
                      ))}
                    </div>

                    <div className="mt-3">
                      <label className="label mb-1 block">Dodatkowe wymagania (opcjonalne)</label>
                      <input className="input text-xs py-1.5"
                        placeholder="np. 'dodaj emoji', 'poziom A2', 'dla uczniów klasy 5'..."
                        value={customPrompt}
                        onChange={e => setCustomPrompt(e.target.value)} />
                    </div>
                  </div>
                )}

                {/* Free prompt box */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-700 text-ink-2 flex items-center gap-1.5">
                      <Brain size={11} /> {selectedType ? 'Własne doprecyzowanie' : 'Opisz kartę pracy'}
                    </label>
                    {selectedType && (
                      <button onClick={() => setFreePrompt(buildPrompt())}
                        className="text-[9px] text-ink-3 hover:text-ink-2 flex items-center gap-1">
                        <Eye size={9} /> Pokaż prompt
                      </button>
                    )}
                  </div>
                  <div className="bg-surface-3 border border-white/[0.06] rounded-xl overflow-hidden">
                    <textarea
                      ref={promptRef}
                      value={freePrompt}
                      onChange={e => { setFreePrompt(e.target.value); setActiveQuickPrompt(null) }}
                      placeholder={selectedType
                        ? "Dodaj własne uwagi np. 'użyj przykładów z codziennego życia', 'po polsku', 'dla dzieci 10 lat'..."
                        : "Opisz dokładnie jaki typ karty pracy chcesz: ile pytań, jaki temat, jaki poziom trudności, co ma być interaktywne, jakie kolory..."}
                      className="w-full bg-transparent border-none outline-none text-xs text-ink p-3 resize-none placeholder:text-ink-3"
                      style={{ minHeight: selectedType ? '80px' : '140px' }}
                    />
                    <div className="border-t border-white/[0.04] px-3 py-2 flex items-center justify-between">
                      <span className="text-[9px] text-ink-3">{(freePrompt || buildPrompt()).length} znaków · Claude Sonnet generuje HTML</span>
                      <button onClick={generate} disabled={loading}
                        className="btn-gold py-2 px-4 text-xs disabled:opacity-40">
                        {loading ? <><Loader2 size={12} className="animate-spin" />Generuję...</>
                          : <><Sparkles size={12} />Generuj kartę</>}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Build prompt preview */}
                {(selectedType || freePrompt) && (
                  <details className="group">
                    <summary className="text-[10px] text-ink-3 cursor-pointer hover:text-ink-2 flex items-center gap-1.5 select-none">
                      <ChevronRight size={10} className="group-open:rotate-90 transition-transform" />
                      Podgląd pełnego promptu dla Claude
                    </summary>
                    <div className="mt-2 bg-surface-2 border border-white/[0.05] rounded-xl p-3 text-[9.5px] text-ink-3 font-mono leading-relaxed max-h-40 overflow-y-auto">
                      {buildPrompt() || freePrompt}
                    </div>
                  </details>
                )}
              </div>
            )}

            {/* PREVIEW STEP */}
            {step === 'preview' && generatedHtml && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Preview toolbar */}
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.05] flex-shrink-0">
                  <CheckCircle size={13} className="text-emerald-400 flex-shrink-0" />
                  <span className="text-xs font-600 text-emerald-400">Karta wygenerowana</span>
                  <div className="flex-1" />
                  <button onClick={() => setPreviewFull(f => !f)} className="block-action-btn" title="Pełny ekran">
                    <Maximize2 size={11} />
                  </button>
                  <button onClick={regenerate} disabled={loading} className="block-action-btn" title="Regeneruj">
                    {loading ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
                  </button>
                  <button onClick={() => setStep('configure')} className="btn-ghost py-1.5 px-3 text-xs">
                    ← Edytuj prompt
                  </button>
                  <button onClick={insertIntoWebook} className="btn-gold py-1.5 px-4 text-xs">
                    <Plus size={12} /> Wstaw do Webooka
                  </button>
                </div>

                {/* iframe preview */}
                <div className="flex-1 overflow-hidden p-4">
                  <div className={`w-full h-full rounded-xl overflow-hidden border border-white/[0.06] transition-all
                    ${previewFull ? 'fixed inset-4 z-10 rounded-2xl shadow-2xl' : ''}`}>
                    <iframe
                      srcDoc={generatedHtml}
                      className="w-full h-full border-none"
                      sandbox="allow-scripts allow-forms"
                      title="Worksheet Preview"
                    />
                  </div>
                </div>

                {/* History */}
                {history.length > 1 && (
                  <div className="px-4 py-2.5 border-t border-white/[0.05] flex-shrink-0">
                    <div className="text-[9.5px] text-ink-3 mb-1.5">Historia wersji:</div>
                    <div className="flex gap-1.5">
                      {history.slice(0, 5).map((h, i) => (
                        <button key={i} onClick={() => setGeneratedHtml(h)}
                          className={`px-2.5 py-1 rounded-lg text-[9px] font-600 border transition-all
                            ${h === generatedHtml
                              ? 'bg-brand-blue/15 border-brand-blue/30 text-brand-light'
                              : 'bg-surface-3 border-white/[0.05] text-ink-3 hover:text-ink-2'}`}>
                          v{history.length - i}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* LOADING STATE */}
            {loading && step !== 'preview' && (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 text-ink-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-blue to-brand-gold flex items-center justify-center"
                >
                  <Sparkles size={22} className="text-white" />
                </motion.div>
                <div className="text-center">
                  <div className="text-sm font-600 text-ink mb-1">Claude generuje kartę pracy...</div>
                  <div className="text-xs text-ink-3">Tworzenie interaktywnego HTML (~3-8 sekund)</div>
                </div>
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-brand-blue"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} />
                  ))}
                </div>
              </div>
            )}

            {/* EMPTY STATE */}
            {step === 'pick' && !loading && (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 text-ink-3 p-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-blue/10 to-brand-gold/10 flex items-center justify-center">
                  <ClipboardList size={28} className="text-ink-3" />
                </div>
                <div className="text-center">
                  <div className="text-sm font-600 text-ink-2 mb-1">Wybierz typ karty pracy</div>
                  <div className="text-xs text-ink-3 leading-relaxed max-w-xs">
                    Wybierz jeden z 20 typów interaktywów po lewej lub użyj szybkich starterów powyżej
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="border-t border-white/[0.05] px-5 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3 text-[10px] text-ink-3">
            <span className="flex items-center gap-1"><CheckCircle size={10} className="text-emerald-400" />20 typów kart</span>
            <span className="flex items-center gap-1"><CheckCircle size={10} className="text-emerald-400" />Pełny HTML + CSS + JS</span>
            <span className="flex items-center gap-1"><CheckCircle size={10} className="text-emerald-400" />Wstaw do Webooka 1 klikiem</span>
          </div>
          <div className="flex gap-2">
            {step === 'preview' && generatedHtml && (
              <>
                <button
                  onClick={() => {
                    const blob = new Blob([generatedHtml], { type: 'text/html' })
                    const a = document.createElement('a')
                    a.href = URL.createObjectURL(blob)
                    a.download = 'karta-pracy.html'
                    a.click()
                    toast.success('Karta pobrana jako HTML!')
                  }}
                  className="btn-ghost py-1.5 px-3 text-xs">
                  <Download size={12} /> Pobierz HTML
                </button>
                <button onClick={insertIntoWebook} className="btn-gold py-1.5 px-4 text-xs">
                  <Plus size={12} /> Wstaw do Webooka
                </button>
              </>
            )}
            {step !== 'preview' && (
              <button onClick={generate} disabled={loading}
                className="btn-gold py-1.5 px-4 text-xs disabled:opacity-40">
                {loading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                Generuj kartę
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
