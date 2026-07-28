import Link from "next/link";
import { ArrowRight, ClipboardList, ShieldCheck, Sparkles, Users, Zap, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const FEATURES = [
  {
    icon: ClipboardList,
    title: "Beautiful intake forms",
    desc: "A guided, multi-step wizard that feels effortless — with autosave so no one loses progress.",
  },
  {
    icon: Users,
    title: "Client dashboard",
    desc: "Search, filter, tag, and sort every client. Everything you need before a session, in one place.",
  },
  {
    icon: Zap,
    title: "Instant notifications",
    desc: "Get emailed the moment a client submits — and they get a confirmation too.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by default",
    desc: "Row-level security, encrypted sessions, and rate-limited endpoints protect every submission.",
  },
  {
    icon: Sparkles,
    title: "Export anywhere",
    desc: "One-click PDF, CSV, or print-ready views of any client's full response history.",
  },
  {
    icon: Lock,
    title: "Private practice, protected",
    desc: "Only you can see your clients' data — enforced at the database level, not just the UI.",
  },
];

const TESTIMONIALS = [
  {
    quote: "Cut my client onboarding time in half. My clients actually enjoy filling this out.",
    name: "Placeholder Nutritionist",
    role: "Private Practice",
  },
  {
    quote: "The dashboard alone is worth it — I finally have all my client notes in one place.",
    name: "Placeholder Nutritionist",
    role: "Wellness Studio",
  },
  {
    quote: "Setup took an afternoon. Clients started submitting the same day.",
    name: "Placeholder Nutritionist",
    role: "Online Coaching",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-40 glass">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              N
            </div>
            NutriIntake
          </div>
          <nav className="hidden items-center gap-8 text-sm font-medium sm:flex">
            <a href="#features" className="text-muted-foreground hover:text-foreground">Features</a>
            <a href="#testimonials" className="text-muted-foreground hover:text-foreground">Testimonials</a>
            <a href="#contact" className="text-muted-foreground hover:text-foreground">Contact</a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/intake">Client intake</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-accent/50 to-background" />
        <div className="container flex flex-col items-center py-24 text-center sm:py-32">
          <span className="mb-6 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground">
            Built for nutrition practitioners
          </span>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
            Client intake that feels premium — for you and them
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Replace scattered forms and spreadsheets with a single, secure intake wizard and a
            dashboard built for how nutritionists actually work.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/intake">
                Try the intake form <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Nutritionist login</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container py-20">
        <div className="mx-auto mb-14 max-w-xl text-center">
          <h2 className="text-3xl font-bold">Everything your practice needs</h2>
          <p className="mt-3 text-muted-foreground">
            From first submission to session prep — one tool, no spreadsheets.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title} className="transition-shadow hover:shadow-glass-lg">
              <CardContent className="pt-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-1.5 font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="bg-secondary/40 py-20">
        <div className="container">
          <div className="mx-auto mb-14 max-w-xl text-center">
            <h2 className="text-3xl font-bold">Trusted by practitioners</h2>
            <p className="mt-3 text-muted-foreground">Sample quotes — swap in your own once you have clients live.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <p className="mb-4 text-sm italic text-foreground/90">&ldquo;{t.quote}&rdquo;</p>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="container py-24 text-center">
        <h2 className="text-3xl font-bold">Ready to modernize your intake?</h2>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          Reach out and we'll get your practice set up.
        </p>
        <Button size="lg" className="mt-8" asChild>
          <a href="mailto:hello@yourpractice.com">Get in touch</a>
        </Button>
      </section>

      <footer className="border-t border-border py-10">
        <div className="container flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} NutriIntake. All rights reserved.</span>
          <div className="flex gap-6">
            <Link href="/login">Nutritionist login</Link>
            <Link href="/intake">Client form</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
