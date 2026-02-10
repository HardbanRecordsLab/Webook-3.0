import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Zap, Users, TrendingUp, Play, Star, ArrowRight, Music, Palette, Code, Shield, BookOpen, Headphones, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail("");
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="container max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">📚</span>
            </div>
            <span className="font-bold text-lg text-slate-900">Webbook Studio</span>
          </div>
          <nav className="hidden md:flex gap-8">
            <a href="#features" className="text-slate-600 hover:text-slate-900 transition">Funkcje</a>
            <a href="#packages" className="text-slate-600 hover:text-slate-900 transition">Pakiety</a>
            <a href="#portfolio" className="text-slate-600 hover:text-slate-900 transition">Portfolio</a>
            <a href="#faq" className="text-slate-600 hover:text-slate-900 transition">FAQ</a>
            <a href="#contact" className="text-slate-600 hover:text-slate-900 transition">Kontakt</a>
          </nav>
          <Button className="bg-blue-600 hover:bg-blue-700">Zarezerwuj Konsultację</Button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="container max-w-7xl mx-auto px-4 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block mb-4 px-4 py-2 bg-blue-100 rounded-full">
              <span className="text-blue-700 text-sm font-semibold">🚀 Nowa Era Edukacji Online</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Webbooki, Które <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-700">Faktycznie Sprzedają Się</span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              Zapominaj o nudnych PDF-ach. Tworzymy interaktywne, multimedialne produkty edukacyjne, które wyglądają jak aplikacje mobilne i faktycznie angażują użytkowników.
            </p>
            <p className="text-lg text-slate-500 mb-8 font-medium">
              Profesjonalne webbooki z sekcjami prawnymi, kartami pracy, quizami i nagraniami audio. Gotowe do publikacji w 3-8 tygodni.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                Zarezerwuj Darmową Konsultację (60 min) <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" className="border-slate-300">
                <Play className="w-4 h-4 mr-2" /> Obejrzyj Demo Szablonu V2
              </Button>
            </div>
            <p className="text-sm text-slate-500">✓ Darmowa konsultacja (60 min) • Brak zobowiązań • Odpowiadamy w ciągu 24h</p>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl blur-3xl"></div>
            <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-slate-200">
              <div className="space-y-4">
                <div className="h-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full w-3/4"></div>
                <div className="h-3 bg-slate-200 rounded-full w-full"></div>
                <div className="h-3 bg-slate-200 rounded-full w-5/6"></div>
                <div className="pt-4 space-y-3">
                  <div className="flex gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-2 bg-slate-200 rounded w-3/4 mb-1"></div>
                      <div className="h-2 bg-slate-100 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-2 bg-slate-200 rounded w-3/4 mb-1"></div>
                      <div className="h-2 bg-slate-100 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-white border-y border-slate-200 py-12">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
              <p className="text-slate-600">Projektów Zrealizowanych</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">98%</div>
              <p className="text-slate-600">Zadowolenia Klientów</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">5+</div>
              <p className="text-slate-600">Lat Doświadczenia</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
              <p className="text-slate-600">Wsparcie Techniczne</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="container max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Co Otrzymujesz w Szablonie V2?</h2>
          <p className="text-xl text-slate-600">Szablon V2 zawiera wszystkie wymagane sekcje prawne i funkcje interaktywne</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Palette className="w-8 h-8" />,
              title: "Profesjonalny Design",
              description: "Nowoczesny, responsywny design z sticky sidebar, gradient header i animacjami. Wygląda jak profesjonalna aplikacja."
            },
            {
              icon: <Shield className="w-8 h-8" />,
              title: "Sekcje Prawne",
              description: "Pełne sekcje prawne: Prawa Autorskie, Disclaimer, Kiedy NIE Korzystać, numery kryzysowe. Ochrona dla Ciebie i użytkowników."
            },
            {
              icon: <BookOpen className="w-8 h-8" />,
              title: "Karty Pracy i Quizy",
              description: "Interaktywne karty pracy i quizy z pytaniami wielokrotnego wyboru. Użytkownicy faktycznie pracują z materiałem."
            },
            {
              icon: <Headphones className="w-8 h-8" />,
              title: "Obsługa Multimediów",
              description: "Wbudowany odtwarzacz audio, embed wideo YouTube, galeria zdjęć. Pełna obsługa różnych typów treści."
            },
            {
              icon: <TrendingUp className="w-8 h-8" />,
              title: "Pasek Postępu",
              description: "Wizualna reprezentacja postępu użytkownika. Motywuje do dalszej pracy i zwiększa completion rate."
            },
            {
              icon: <Zap className="w-8 h-8" />,
              title: "Nawigacja i Responsywność",
              description: "Intuicyjna nawigacja, sticky sidebar, pełna responsywność. Działa idealnie na każdym urządzeniu."
            }
          ].map((feature, idx) => (
            <Card key={idx} className="border-slate-200 hover:shadow-lg transition">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                  {feature.icon}
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* PACKAGES */}
      <section id="packages" className="bg-slate-50 py-20">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Pakiety Cenowe</h2>
            <p className="text-xl text-slate-600">Wybierz pakiet dostosowany do Twoich potrzeb</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Starter",
                price: "3 500 - 5 000 PLN",
                time: "10-14 dni",
                description: "Dla małych produktów i lead magnetów",
                features: [
                  "Do 30 stron treści",
                  "Responsywny layout",
                  "Do 10 grafik",
                  "Podstawowe animacje",
                  "Sekcje prawne (Prawa Autorskie, Disclaimer)",
                  "1 nagranie audio",
                  "Karty pracy (2-3)",
                  "5 dni wsparcia"
                ],
                highlighted: false
              },
              {
                name: "Professional",
                price: "7 000 - 10 000 PLN",
                time: "3-4 tygodnie",
                description: "Dla pełnowartościowych kursów online",
                features: [
                  "Do 80 stron treści",
                  "Custom design",
                  "Do 30 grafik + infografiki",
                  "Do 15 nagrań audio",
                  "Karty pracy (8-12)",
                  "Quizy (5-8)",
                  "Pełne sekcje prawne",
                  "Pasek postępu",
                  "Embed wideo YouTube",
                  "30 dni wsparcia",
                  "5 grafik social media"
                ],
                highlighted: true
              },
              {
                name: "Premium",
                price: "14 000 - 20 000 PLN",
                time: "6-8 tygodni",
                description: "Dla flagowych produktów edukacyjnych",
                features: [
                  "Bez limitu stron",
                  "Ekskluzywny design",
                  "Bez limitu grafik",
                  "Bez limitu nagrań audio",
                  "Gamifikacja i osiągnięcia",
                  "System członkostwa",
                  "Integracja płatności",
                  "Email sequence (5-7)",
                  "Landing page + sales page",
                  "Analytics i tracking",
                  "60 dni wsparcia",
                  "10 grafik social media"
                ],
                highlighted: false
              }
            ].map((pkg, idx) => (
              <Card key={idx} className={`border-2 ${pkg.highlighted ? "border-blue-600 shadow-xl" : "border-slate-200"}`}>
                {pkg.highlighted && (
                  <div className="bg-blue-600 text-white px-4 py-2 text-center text-sm font-semibold">
                    ⭐ Najpopularniejszy
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                  <CardDescription>{pkg.description}</CardDescription>
                  <div className="text-3xl font-bold text-slate-900 mt-4">{pkg.price}</div>
                  <p className="text-sm text-slate-500 mt-2">Czas realizacji: {pkg.time}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {pkg.features.map((feature, fidx) => (
                      <li key={fidx} className="flex gap-2 items-start">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className={`w-full mt-6 ${pkg.highlighted ? "bg-blue-600 hover:bg-blue-700" : ""}`}>
                    Dowiedz Się Więcej
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* PORTFOLIO */}
      <section id="portfolio" className="container max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Portfolio - Case Studies</h2>
          <p className="text-xl text-slate-600">Zobaczcie, co już stworzyliśmy dla naszych klientów</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {[
            {
              title: "EFT po Toksycznym Związku",
              author: "Magdalena Iskra",
              role: "Terapeutka",
              description: "Program 21-dniowy z 80+ stronami treści, 21 nagraniami audio i kartami pracy. Sprzedaż za 299 PLN.",
              results: "150+ klientów w pierwszym miesiącu • 4.9/5 ocena • 45,000 PLN przychodu",
              image: "🧘"
            },
            {
              title: "Kurs Biznesowy - Scaling Your Business",
              author: "Jan Kowalski",
              role: "Coach Biznesowy",
              description: "Flagowy kurs z systemem płatności, email marketing i zaawansowanym designem. Sprzedaż za 999 PLN.",
              results: "80+ klientów w pierwszym miesiącu • 87% completion rate • 79,920 PLN przychodu",
              image: "💼"
            }
          ].map((project, idx) => (
            <Card key={idx} className="border-slate-200 overflow-hidden hover:shadow-lg transition">
              <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center">
                <span className="text-white text-6xl">{project.image}</span>
              </div>
              <CardHeader>
                <CardTitle>{project.title}</CardTitle>
                <CardDescription>{project.author} - {project.role}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">{project.description}</p>
                <p className="text-sm text-green-600 font-semibold mb-4">✓ {project.results}</p>
                <Button variant="outline" className="w-full">
                  Obejrzyj Projekt <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-slate-50 py-20">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Co Mówią Nasi Klienci?</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Magdalena Iskra",
                role: "Terapeutka",
                text: "Kamil stworzył dla mnie dokładnie to, o czym marzyłam. Program EFT wygląda profesjonalnie, działa płynnie na wszystkich urządzeniach i moi klienci są zachwyceni interaktywną formą.",
                rating: 5
              },
              {
                name: "Jan Kowalski",
                role: "Coach Biznesowy",
                text: "Webbook to zmiana gry dla mojego biznesu. Mogę teraz sprzedawać kursy za wyższą cenę, a klienci są bardziej zaangażowani. Zwrot z inwestycji w ciągu 3 tygodni!",
                rating: 5
              },
              {
                name: "Anna Nowak",
                role: "Edukatorka",
                text: "Profesjonalizm, szybkość i wsparcie - to wszystko, czego potrzebowałam. Rekomenduje HardbanRecords Lab każdemu, kto chce stworzyć flagowy produkt edukacyjny.",
                rating: 5
              }
            ].map((testimonial, idx) => (
              <Card key={idx} className="border-slate-200">
                <CardHeader>
                  <div className="flex gap-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                  <CardDescription>{testimonial.role}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 italic">"{testimonial.text}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="container max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Najczęstsze Pytania</h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          {[
            {
              q: "Ile czasu zajmuje stworzenie webbooka?",
              a: "Zależy od pakietu: Starter 10-14 dni, Professional 3-4 tygodnie, Premium 6-8 tygodni. Czas obejmuje konsultacje, design, integrację treści i testowanie."
            },
            {
              q: "Czy szablon V2 zawiera sekcje prawne?",
              a: "Tak! Szablon V2 zawiera wszystkie wymagane sekcje: Prawa Autorskie, Disclaimer, Kiedy NIE Korzystać, Do Kogo Jest Program, Co Program Robi/Nie Obiecuje, numery telefonów kryzysowych."
            },
            {
              q: "Czy mogę sprzedawać webbook bezpośrednio?",
              a: "Tak! W pakiecie Premium zawiera się integracja płatności (Stripe, PayPal, Przelewy24). W pakietach Starter i Professional możesz sprzedawać przez Gumroad, SendOwl lub Thinkific."
            },
            {
              q: "Czy webbook będzie responsywny?",
              a: "Tak! Wszystkie webbooki są w pełni responsywne i działają idealnie na desktop, tablet i smartfonie. Testujemy na wszystkich urządzeniach przed dostarczeniem."
            },
            {
              q: "Czy mogę zmienić design po ukończeniu?",
              a: "Oczywiście! Wszystkie webbooki są w pełni edytowalne. Otrzymujesz pełny kod HTML/CSS, instrukcje do edycji i 30-60 dni wsparcia technicznego."
            }
          ].map((faq, idx) => (
            <Card key={idx} className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg">❓ {faq.q}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">{faq.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section id="contact" className="container max-w-7xl mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-12 text-white text-center">
          <h2 className="text-4xl font-bold mb-4">Gotów na Zmianę?</h2>
          <p className="text-xl mb-8 opacity-90">
            Zarezerwuj darmową konsultację strategiczną (60 minut). Omówimy Twoją wizję i przygotujemy wstępną koncepcję webbooka.
          </p>
          
          <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-6">
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Twój email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-3 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-white"
                required
              />
              <Button type="submit" className="bg-white text-blue-600 hover:bg-slate-100">
                Wyślij
              </Button>
            </div>
          </form>

          {submitted && (
            <p className="text-green-100">✓ Dziękuję! Skontaktujemy się wkrótce.</p>
          )}

          <p className="text-sm opacity-75">Brak zobowiązań • Odpowiadamy w ciągu 24h</p>
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section className="container max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-900">Cecha</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-900">STARTER</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-900">PROFESSIONAL</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-900">PREMIUM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {[
                { feature: "Cena", starter: "3.5-5k", pro: "7-10k", premium: "14-20k" },
                { feature: "Czas", starter: "10-14 dni", pro: "3-4 tyg.", premium: "6-8 tyg." },
                { feature: "Strony", starter: "Do 30", pro: "Do 80", premium: "Bez limitu" },
                { feature: "Grafiki", starter: "Do 10", pro: "Do 30", premium: "Bez limitu" },
                { feature: "Audio", starter: "1", pro: "Do 15", premium: "Bez limitu" },
                { feature: "Karty Pracy", starter: "2-3", pro: "8-12", premium: "Bez limitu" },
                { feature: "Quizy", starter: "—", pro: "5-8", premium: "Adaptacyjne" },
                { feature: "Sekcje Prawne", starter: "Podstawowe", pro: "Pełne", premium: "Zaawansowane" },
                { feature: "Płatności", starter: "—", pro: "—", premium: "✅" },
                { feature: "Wsparcie", starter: "5 dni", pro: "30 dni", premium: "60 dni" }
              ].map((row, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-3 font-medium text-slate-900">{row.feature}</td>
                  <td className="px-4 py-3 text-center text-slate-600">{row.starter}</td>
                  <td className="px-4 py-3 text-center text-slate-600">{row.pro}</td>
                  <td className="px-4 py-3 text-center text-slate-600">{row.premium}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">📚</span>
                </div>
                <span className="font-bold text-white">Webbook Studio</span>
              </div>
              <p className="text-sm">Tworzymy interaktywne webbooki, które faktycznie sprzedają się.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Pakiety</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#packages" className="hover:text-white transition">Webbook Starter</a></li>
                <li><a href="#packages" className="hover:text-white transition">Webbook Professional</a></li>
                <li><a href="#packages" className="hover:text-white transition">Webbook Premium</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Firma</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">O Nas</a></li>
                <li><a href="#portfolio" className="hover:text-white transition">Portfolio</a></li>
                <li><a href="#faq" className="hover:text-white transition">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Kontakt</h4>
              <ul className="space-y-2 text-sm">
                <li>📧 hardbanrecordslab.pl@gmail.com</li>
                <li>📱 +48 725 663 741</li>
                <li>📍 Wiercień</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8 text-center text-sm">
            <p>&copy; 2026 HardbanRecords Lab. Wszystkie prawa zastrzeżone.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
