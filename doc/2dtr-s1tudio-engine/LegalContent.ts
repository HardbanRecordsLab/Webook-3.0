
export const LEGAL_DOCS = {
  tos: {
    title: "Terms of Service - DTR STUDIO ENGINE",
    content: `REGULAMIN ŚWIADCZENIA USŁUG DROGĄ ELEKTRONICZNĄ - DTR STUDIO ENGINE --- HARDBANRECORDS LAB v7.0
    
    1. POSTANOWIENIA OGÓLNE I DEFINICJE SYSTEMOWE
    Niniejszy regulamin określa zasady korzystania z zaawansowanego systemu automatyzacji DTP (Desktop Publishing) o nazwie DTR STUDIO ENGINE. Właścicielem, głównym inżynierem i administratorem systemu jest Kamil Skomra, działający pod marką HardbanRecords Lab (kontakt bezpośredni: hardbanrecordslab.pl@gmail.com). Korzystając z aplikacji, użytkownik akceptuje wszystkie poniższe warunki bez zastrzeżeń. System DTR STUDIO ENGINE jest profesjonalną platformą klasy korporacyjnej, wykorzystującą najnowocześniejsze modele sztucznej inteligencji (Gemini 2.5/3.0) do analizy, składu szpaltowego i projektowania publikacji cyfrowych oraz drukowanych. Każde użycie silnika jest rejestrowane pod unikalnym ID licencji w celu zapewnienia integralności prawnej projektów.

    2. LICENCJONOWANIE I PRAWA KOMERCYJNE
    Użytkownik uzyskuje dostęp do silnika DTR w modelu SaaS. Kamil Skomra udziela użytkownikowi licencji, która w wersji Pro/Enterprise przechodzi w pełne prawa do komercyjnej eksploatacji wygenerowanych plików PDF. Oznacza to, że użytkownik może sprzedawać książki złożone przez DTR STUDIO ENGINE bez konieczności uiszczania dodatkowych opłat licencyjnych (Royalty-free). Jednakże, kod źródłowy silnika, algorytmy Orchestratora oraz nazwa DTR STUDIO ENGINE pozostają wyłączną własnością Kamila Skomry. Zakazuje się kopiowania struktury interfejsu oraz inżynierii wstecznej algorytmów składu.

    3. ODPOWIEDZIALNOŚĆ ZA PROCES ANALIZY (DTR LOGIC)
    System przetwarza manuskrypty dostarczone przez użytkownika. Użytkownik oświadcza, że posiada wszelkie prawa autorskie do przesyłanych treści. HardbanRecords Lab nie bierze odpowiedzialności za naruszenia praw osób trzecich dokonane przez użytkownika. Silnik DTR działa na zasadzie wysokiej precyzji, ale ze względu na charakter modeli probabilistycznych, wynik pracy AI może wymagać korekty (Proofing). Kamil Skomra nie odpowiada za błędy merytoryczne w tekście źródłowym ani za nieprawidłowości w druku wynikające z braku przeprowadzenia procedury "Final Proof" przez użytkownika przed wysłaniem pliku do drukarni.

    4. ASPEKTY FINANSOWE I SUBSKRYPCYJNE
    Dostęp do zaawansowanych funkcji, takich jak Batch Processing, Masterpiece Cover Render oraz High-Res PDF Export, jest płatny. Cennik jest dynamiczny i zależy od wybranego poziomu Enterprise. Kamil Skomra zastrzega sobie prawo do zmiany stawek, o czym użytkownicy zostaną poinformowani z 30-dniowym wyprzedzeniem. Wszelkie reklamacje dotyczące płatności należy kierować na adres hardbanrecordslab.pl@gmail.com. Zwroty są rozpatrywane indywidualnie w przypadku wystąpienia błędów technicznych uniemożliwiających wygenerowanie pliku końcowego.

    5. ETYKA AI I ZAKAZ NADUŻYĆ
    DTR STUDIO ENGINE nie może być wykorzystywany do generowania treści nienawistnych, nielegalnych lub promujących dezinformację. Kamil Skomra rezerwuje sobie prawo do natychmiastowego wypowiedzenia licencji i zablokowania dostępu do silnika (Blacklisting) każdemu użytkownikowi, który narusza etykę wydawniczą. System posiada wbudowane filtry bezpieczeństwa (Safety Filters) zgodne ze standardami Google Cloud.

    6. JURYSDYKCJA I SPORY
    Wszelkie spory wynikające z użytkowania DTR STUDIO ENGINE będą rozstrzygane polubownie, a w przypadku braku porozumienia – przez sąd właściwy dla siedziby administratora systemu (Kamil Skomra). Niniejszy regulamin stanowi kompletną umowę między użytkownikiem a HardbanRecords Lab. Jeśli jakiekolwiek postanowienie zostanie uznane za nieważne, pozostałe punkty pozostają w mocy. Wszelka korespondencja prawna musi być kierowana drogą elektroniczną na oficjalny e-mail: hardbanrecordslab.pl@gmail.com.`
  },
  privacy: {
    title: "Privacy Policy (RODO/GDPR)",
    content: `POLITYKA PRYWATNOŚCI I OCHRONY DANYCH OSOBOWYCH - HARDBANRECORDS LAB
    
    1. ADMINISTRATOR I KONTAKT
    Administratorem danych osobowych w systemie DTR STUDIO ENGINE jest Kamil Skomra, prowadzący działalność pod marką HardbanRecords Lab. Wszelkie pytania dotyczące ochrony prywatności należy kierować na adres: hardbanrecordslab.pl@gmail.com. Działamy w pełnej zgodności z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 (RODO). Naszym priorytetem jest ochrona Twojej własności intelektualnej – manuskrypty są traktowane jako dane o najwyższym priorytecie bezpieczeństwa.

    2. ZAKRES PRZETWARZANIA DANYCH W SILNIKU DTR
    W celu realizacji usługi składu, system przetwarza: adres e-mail, ID licencji, dane techniczne przeglądarki oraz treść manuskryptu. Ważne: Treść manuskryptu jest przetwarzana w architekturze "Transient Processing". Oznacza to, że po wygenerowaniu layoutu i zamknięciu sesji, dane tekstowe nie są trwale archiwizowane na serwerach HardbanRecords Lab, chyba że użytkownik aktywnie wybierze opcję "Hardban Cloud Save". Gwarantuje to maksymalną poufność Twoich dzieł literackich.

    3. TRANSFER DANYCH DO PODMIOTÓW TRZECICH (AI CONNECTORS)
    DTR STUDIO ENGINE korzysta z zewnętrznych jednostek obliczeniowych: Google Cloud (Gemini API) oraz Pollinations.AI. Dane przesyłane do tych usług są szyfrowane kluczem AES-256. Przesyłane są jedynie fragmenty tekstu niezbędne do analizy strukturalnej i wizualnej. Kamil Skomra zapewnia, że umowy z dostawcami API zabraniają wykorzystywania Twoich danych do trenowania publicznych modeli AI (Enterprise Data Privacy).

    4. PLIKI COOKIES I ANALITYKA SESJI
    Używamy plików cookies wyłącznie w celach technicznych: utrzymania sesji "DTR Studio", zapamiętania ustawień "Visual DNA" oraz autoryzacji dostępu do funkcji Pro. Nie sprzedajemy Twoich danych firmom marketingowym. Statystyki użycia silnika są zbierane w sposób zanonimizowany i służą wyłącznie Kamilowi Skomrze do optymalizacji szybkości działania Orchestratora.

    5. PRAWA UŻYTKOWNIKA I USUNIĘCIE KONTA
    Zgodnie z RODO, masz prawo do wglądu w swoje dane, ich poprawienia oraz całkowitego usunięcia (Prawo do bycia zapomnianym). Usunięcie konta skutkuje natychmiastowym i nieodwracalnym skasowaniem ID licencji oraz wszystkich metadanych projektów z bazy DTR STUDIO ENGINE. Aby zainicjować ten proces, skontaktuj się z nami: hardbanrecordslab.pl@gmail.com.

    6. ZMIANY W POLITYCE I BEZPIECZEŃSTWO
    Niniejsza polityka jest aktualizowana wraz z rozwojem technologii AI. O wszelkich istotnych zmianach Kamil Skomra poinformuje użytkowników poprzez Dashboard aplikacji. Stosujemy zaawansowane firewalle i systemy wykrywania włamań (IDS), aby chronić DTR STUDIO ENGINE przed atakami typu brute-force i wyciekami danych.`
  },
  gdpr: {
    title: "GDPR Compliance Statement",
    content: `DEKLARACJA ZGODNOŚCI RODO/GDPR - DTR STUDIO ENGINE
    
    1. STATUS ZGODNOŚCI OPERACYJNEJ
    System DTR STUDIO ENGINE został zaprojektowany i zbudowany przez Kamila Skomrę z uwzględnieniem zasad "Privacy by Design". Oznacza to, że ochrona danych osobowych i własności intelektualnej jest integralną częścią architektury oprogramowania. HardbanRecords Lab spełnia wszystkie wymogi stawiane przez RODO dla dostawców usług chmurowych operujących na terenie Unii Europejskiej.

    2. INSPEKTOR OCHRONY DANYCH (DPO)
    Rolę inspektora ochrony danych pełni Kamil Skomra. Kontakt: hardbanrecordslab.pl@gmail.com. Każde zgłoszenie dotyczące naruszenia prywatności jest analizowane w trybie ekspresowym (do 24h). Prowadzimy rejestr czynności przetwarzania zgodnie z art. 30 RODO, co pozwala na pełną transparentność operacyjną przed organami nadzorczymi (UODO).

    3. SUB-PROCESSORS I BEZPIECZEŃSTWO LOKALIZACJI
    Głównym podmiotem przetwarzającym dane w imieniu HardbanRecords Lab jest Google Ireland Limited. Dane są przetwarzane w regionach europejskich (europe-west), co zapewnia zgodność z wyrokami TSUE dotyczącymi transferu danych (Schrems II). Kamil Skomra osobiście weryfikuje certyfikaty bezpieczeństwa (ISO 27001, SOC 2) wszystkich dostawców infrastruktury dla DTR STUDIO ENGINE.

    4. PROCEDURA NARUSZENIA DANYCH
    W mało prawdopodobnym przypadku wycieku danych, HardbanRecords Lab posiada wdrożony plan reagowania na incydenty. Zobowiązujemy się do powiadomienia właściwego organu nadzorczego oraz poszkodowanych użytkowników w czasie nieprzekraczającym 72 godzin od wykrycia incydentu. Nasza infrastruktura jest monitorowana 24/7 przez zautomatyzowane systemy bezpieczeństwa Kamila Skomry.

    5. MINIMALIZACJA DANYCH
    Zbieramy tylko te dane, bez których DTR STUDIO ENGINE nie mógłby funkcjonować. Nie wymagamy podawania numerów telefonów, adresów zamieszkania ani innych danych wrażliwych. Twoja tożsamość w systemie jest oparta na adresie e-mail i unikalnym ID licencji, co minimalizuje skutki potencjalnego naruszenia prywatności.

    6. KONTAKT W SPRAWACH COMPLIANCE
    Jeśli Twoja organizacja wymaga dedykowanej umowy powierzenia przetwarzania danych (DPA) przed wdrożeniem DTR STUDIO ENGINE Enterprise, prosimy o kontakt na: hardbanrecordslab.pl@gmail.com. Kamil Skomra przygotuje odpowiednią dokumentację dostosowaną do specyficznych wymogów prawnych Twojej firmy.`
  },
  cookies: {
    title: "Cookie Policy",
    content: `POLITYKA PLIKÓW COOKIES - DTR STUDIO ENGINE
    
    1. TECHNOLOGIA STORAGE W HARDBANRECORDS LAB
    Pliki cookies używane w systemie DTR STUDIO ENGINE służą do zapewnienia najwyższej jakości interakcji z Dashboardem. Kamil Skomra wykorzystuje je, aby aplikacja "rozumiała" kontekst Twojej pracy, np. pamiętała, który rozdział aktualnie edytujesz lub jakie DNA wizualne zostało wybrane dla Twojego manuskryptu.

    2. PODZIAŁ COOKIES W SYSTEMIE
    a) Cookies Niezbędne: Bez nich DTR STUDIO ENGINE nie uruchomi się. Służą do autoryzacji klucza licencyjnego i zabezpieczenia przed atakami CSRF.
    b) Cookies Funkcjonalne: Zapamiętują Twoje preferencje w Blueprint Studio – skalę fontów, kolory accent oraz typ papieru (A4, Kindle itp.).
    c) Cookies Wydajnościowe: Pozwalają Kamilowi Skomrze monitorować obciążenie serwerów i optymalizować czas odpowiedzi Orchestratora AI.

    3. OKRES PRZECHOWYWANIA
    Większość cookies w DTR STUDIO ENGINE to pliki sesyjne, które znikają po zamknięciu karty przeglądarki. Pliki stałe są przechowywane maksymalnie przez 30 dni, aby umożliwić Ci powrót do niedokończonego projektu bez konieczności ponownego ładowania manuskryptu.

    4. KONTROLA UŻYTKOWNIKA
    Masz pełną kontrolę nad ciasteczkami poprzez ustawienia swojej przeglądarki. Możesz je w każdej chwili usunąć. Pamiętaj jednak, że zablokowanie wszystkich cookies uniemożliwi korzystanie z zaawansowanych funkcji DTR STUDIO ENGINE, takich jak generowanie grafik czy eksport PDF, ponieważ system nie będzie w stanie zweryfikować Twojej sesji.

    5. TRANSPARENTNOŚĆ I BEZPIECZEŃSTWO
    Nasze cookies nie są wykorzystywane do śledzenia Cię na innych stronach ani do budowania Twojego profilu reklamowego. Kamil Skomra gwarantuje, że kod odpowiedzialny za obsługę cookies w DTR STUDIO ENGINE jest wolny od skryptów śledzących firm trzecich (No Third-Party Ad Trackers).

    6. PYTANIA TECHNICZNE
    Jeśli potrzebujesz szczegółowej listy nazw i parametrów cookies używanych przez system w celach audytowych, napisz na: hardbanrecordslab.pl@gmail.com. Chętnie udostępnimy pełną dokumentację techniczną infrastruktury HardbanRecords Lab.`
  },
  ai_disclaimer: {
    title: "AI Disclaimer & Ethics Statement",
    content: `OŚWIADCZENIE DOTYCZĄCE SZTUCZNEJ INTELIGENCJI I ETYKI - DTR STUDIO ENGINE
    
    1. STATUS TECHNOLOGICZNY SYSTEMU
    DTR STUDIO ENGINE jest narzędziem wspieranym przez modele Generative AI. Kamil Skomra podkreśla, że choć system osiąga 99.9% dokładności w analizie strukturalnej, użytkownik musi mieć świadomość ograniczeń technologii sieci neuronowych. AI w procesie DTP pełni rolę "Inteligentnego Asystenta", a nie ostatecznego cenzora lub redaktora.

    2. RYZYKO HALUCYNACJI I BŁĘDÓW SKŁADU
    Sztuczna Inteligencja może w rzadkich przypadkach generować błędy, np. nieprawidłowe przenoszenie wyrazów lub nakładanie się elementów graficznych w ekstremalnie gęstym tekście. Kamil Skomra oraz HardbanRecords Lab nie ponoszą odpowiedzialności za błędy techniczne w wydrukowanym nakładzie, jeśli użytkownik pominął etap "Final Proof". Zawsze zalecamy wydruk próbny jednej kopii przed zleceniem masowej produkcji.

    3. ETYKA I WŁASNOŚĆ INTELEKTUALNA AI
    Wszystkie grafiki generowane przez DTR STUDIO ENGINE (np. okładki) powstają na bazie algorytmów Stable Diffusion. HardbanRecords Lab deklaruje, że nie wykorzystuje danych treningowych naruszających prawa autorskie artystów w sposób bezpośredni. Użytkownik jest odpowiedzialny za sprawdzenie, czy wygenerowane przez AI obrazy nie naruszają znaków towarowych w jego specyficznej branży.

    4. DEKLARACJA TRANSPARENTNOŚCI
    Kamil Skomra promuje zasadę "AI-Assisted, Human-Verified". Zachęcamy do umieszczania w stopce książki informacji: "Layout orchestrated by DTR STUDIO ENGINE --- HARDBANRECORDS LAB". Buduje to świadomość nowej ery cyfrowego rzemiosła i wspiera rozwój etycznych narzędzi AI.

    5. OGRANICZENIA PRAWNE WYNIKÓW AI
    W niektórych jurysdykcjach prawo autorskie nie obejmuje w pełni utworów wygenerowanych wyłącznie przez AI bez istotnego wkładu ludzkiego. Korzystając z DTR STUDIO ENGINE, akceptujesz fakt, że status prawny niektórych elementów wizualnych może być niepewny i ewoluować wraz z nowymi regulacjami (np. AI Act w UE).

    6. KONTAKT I WSPARCIE ETYCZNE
    Jeśli uważasz, że system wygenerował treść naruszającą normy społeczne lub Twoje prawa, prosimy o niezwłoczny kontakt: hardbanrecordslab.pl@gmail.com. Kamil Skomra osobiście nadzoruje filtry bezpieczeństwa i stale dąży do eliminacji uprzedzeń (Bias) z algorytmów DTR STUDIO ENGINE.`
  },
  guide: {
    title: "DTR STUDIO ENGINE: Professional User Guide",
    content: `PROFESJONALNY PRZEWODNIK UŻYTKOWNIKA - DTR STUDIO ENGINE --- HARDBANRECORDS LAB
    
    1. FILOZOFIA PRACY W DTR STUDIO
    Witaj w najbardziej zaawansowanym środowisku DTP wspieranym przez AI. DTR STUDIO ENGINE, zaprojektowany przez Kamila Skomrę, to coś więcej niż konwerter plików. To cyfrowy zecer, który rozumie strukturę Twojego manuskryptu. Przewodnik ten pomoże Ci w pełni wykorzystać potencjał silnika HardbanRecords Lab i przejść od surowego tekstu do arcydzieła wydawniczego.

    2. ETAP 1: KONFIGURACJA I INGEST (MANUSCRIPT ENGINE)
    Twoja praca zaczyna się w panelu "DTR Manuscript Engine". Wklej swój tekst w formacie Markdown. System najlepiej interpretuje strukturę, gdy rozdziały są oznaczone nagłówkami # oraz ##. Uzupełnij metadane: Tytuł projektu i Autor. Te dane zostaną użyte przez Orchestrator do wygenerowania unikalnego ID projektu oraz Master Cover. Jeśli Twój tekst zawiera notatki boczne, użyj tagów [side]tekst[/side] – zostaną one inteligentnie umieszczone na marginesach w układzie "Side Panel".

    3. ETAP 2: WYBÓR DNA WIZUALNEGO (MATRIX)
    W prawym panelu Dashboardu wybierz "Studio DNA Matrix". Każdy szablon to inny zestaw reguł typograficznych i matematycznych. "Elite Renaissance" to klasyczna elegancja, podczas gdy "Technical Brutalism" oferuje surowy, inżynieryjny wygląd. Wybór DNA determinuje, jak AI będzie planować światło międzywierszowe i kompozycję grafik w całym dokumencie.

    4. ETAP 3: ORCHESTRACJA I ANALIZA AI
    Kliknij "Launch Now". W tym momencie Orchestrator AI łączy się z Google Cloud i analizuje gęstość tekstu, emocjonalny mood każdego rozdziału oraz planuje rozmieszczenie grafik. Silnik automatycznie dobierze jeden z pięciu profesjonalnych layoutów (np. Magazine Feature dla wstępu, Academic Split dla danych). Proces ten trwa zazwyczaj do 60 sekund i kończy się przygotowaniem "Blueprintu".

    5. ETAP 4: BLUEPRINT STUDIO I SZLIFOWANIE
    W Blueprint Studio możesz dopracować detale. Wygeneruj Master Cover za pomocą "Masterpiece Render" oraz ilustracje rozdziałów. Jeśli potrzebujesz własnych grafik, użyj "Asset Pool", aby je zaimportować. W sekcji "Settings" możesz dostosować Type Scale i Line Rhythm. Każda zmiana jest natychmiastowo aplikowana do wirtualnego arkusza druku. To tutaj Twoja wizja nabiera ostatecznych kształtów.

    6. ETAP 5: EKSPORT I ARCHIWIZACJA
    Ostatni krok to "Final Proof". Przejrzyj całą książkę w widoku podglądu. Jeśli wszystko jest idealne, kliknij "Generate Master PDF". Silnik DTR STUDIO ENGINE wygeneruje plik zoptymalizowany pod kątem druku (standard PDF/X). Pamiętaj, że w razie problemów Kamil Skomra i zespół HardbanRecords Lab służą pomocą pod adresem: hardbanrecordslab.pl@gmail.com. Powodzenia w wydawaniu Twojego dzieła!`
  }
};
