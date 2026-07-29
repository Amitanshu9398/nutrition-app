import Link from "next/link";
import { ArrowRight, Mail, Dumbbell, Medal, LineChart, Target, Zap, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BrandMark } from "@/components/marketing/brand-mark";
import { WhatsAppButton } from "@/components/marketing/whatsapp-button";
import { BRAND } from "@/lib/brand";

const METHOD_PILLARS = [
  {
    icon: LineChart,
    title: "Numbers, not guesswork",
    desc: "Your targets are calculated from your stats and activity — then adjusted weekly based on real results, not vibes.",
  },
  {
    icon: Target,
    title: "Built around your life",
    desc: "The intake maps your food preferences, schedule, and habits — so the plan fits you, not the other way around.",
  },
  {
    icon: Zap,
    title: "Fast iteration",
    desc: "Weekly check-ins mean the plan changes as fast as your body does. No sticking to a plan that stopped working.",
  },
];

const PROCESS = [
  { step: "01", title: "Submit your intake", desc: "A guided 4-minute form covering your stats, lifestyle, and food preferences." },
  { step: "02", title: "I build your plan", desc: "Personally reviewed and calculated — not a template, not auto-generated." },
  { step: "03", title: "Weekly accountability", desc: "Check-ins, adjustments, and direct WhatsApp access as you progress." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-40 glass">
        <div className="container flex h-16 items-center justify-between">
          <BrandMark />
          <nav className="hidden items-center gap-8 text-sm font-medium sm:flex">
            <a href="#method" className="text-muted-foreground hover:text-foreground">Method</a>
            <a href="#trust" className="text-muted-foreground hover:text-foreground">Why Fuel Lab</a>
            <a href="#process" className="text-muted-foreground hover:text-foreground">How it works</a>
            <a href="#contact" className="text-muted-foreground hover:text-foreground">Contact</a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/intake">Start intake</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero — dark, bold, athletic */}
      <section className="relative overflow-hidden bg-[hsl(var(--brand-ink))] text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(circle at 20% 20%, hsl(var(--primary) / 0.25), transparent 55%), radial-gradient(circle at 80% 60%, hsl(var(--primary) / 0.15), transparent 50%)",
          }}
        />
        <div className="container relative flex flex-col items-start py-24 sm:py-32">
          <span className="mb-6 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-white/70">
            Data-driven nutrition coaching
          </span>
          <h1 className="max-w-3xl font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl">
            Train your nutrition like you train everything else.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-white/70">
            No fad plans. No guesswork. Fuel Lab builds your nutrition strategy from your numbers,
            your lifestyle, and your goals — then adjusts it every week until it works.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/intake">
                Start your intake <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <WhatsAppButton />
          </div>
          <p className="mt-4 text-xs text-white/40">Takes about 4 minutes · reviewed personally, not automated</p>
        </div>
      </section>

      {/* Proof — placeholder, ready for real transformations */}
      <section className="container py-20">
        <div className="mx-auto mb-12 max-w-xl text-center">
          <h2 className="font-display text-3xl font-bold">Results, not promises</h2>
          <p className="mt-3 text-muted-foreground">
            Client transformations go here as they come in — real photos, real numbers.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="flex aspect-[4/5] items-center justify-center bg-secondary text-sm text-muted-foreground">
                Transformation photo {i}
              </div>
              <CardContent className="pt-4">
                <p className="text-sm font-medium">Client result coming soon</p>
                <p className="text-xs text-muted-foreground">Placeholder — swap once available</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Method */}
      <section id="method" className="bg-secondary/40 py-20">
        <div className="container">
          <div className="mx-auto mb-14 max-w-xl text-center">
            <h2 className="font-display text-3xl font-bold">The method</h2>
            <p className="mt-3 text-muted-foreground">Science-backed, personally calculated, weekly adjusted.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {METHOD_PILLARS.map((m) => (
              <Card key={m.title}>
                <CardContent className="pt-6">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <m.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-1.5 font-semibold">{m.title}</h3>
                  <p className="text-sm text-muted-foreground">{m.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why trust me — honest, results-based */}
      <section id="trust" className="container py-20">
        <div className="mx-auto grid max-w-4xl gap-10 sm:grid-cols-2 sm:items-center">
          <div>
            <h2 className="font-display text-3xl font-bold">Why Fuel Lab</h2>
            <p className="mt-4 text-muted-foreground">
              I'm not selling a certification — I'm selling a method I use on myself and every
              client. Every plan is grounded in the same data-driven approach, reviewed personally,
              and adjusted based on what's actually happening with your body, not a template.
            </p>
            <div className="mt-6 flex flex-col gap-3 text-sm">
              <div className="flex items-center gap-3">
                <Dumbbell className="h-4 w-4 text-primary" />
                <span>Competitive powerlifter — I train under the same discipline I coach</span>
              </div>
              <div className="flex items-center gap-3">
                <Medal className="h-4 w-4 text-primary" />
                <span>Endurance athlete, marathon in progress</span>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>Every submission reviewed by me — not auto-generated</span>
              </div>
            </div>
          </div>
          <Card className="p-6">
            <h3 className="mb-2 font-semibold">A note on credentials</h3>
            <p className="text-sm text-muted-foreground">
              I don't hold a formal nutrition certification — I'm upfront about that. What I offer
              instead is a rigorously data-driven approach, direct personal attention on every
              plan, and results you can track weekly. If you want a name-brand credential behind
              your coach, this may not be the right fit — if you want someone deeply invested in
              getting your numbers right, that's exactly what Fuel Lab is built for.
            </p>
          </Card>
        </div>
      </section>

      {/* Process */}
      <section id="process" className="bg-secondary/40 py-20">
        <div className="container">
          <div className="mx-auto mb-14 max-w-xl text-center">
            <h2 className="font-display text-3xl font-bold">How coaching works</h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {PROCESS.map((p) => (
              <div key={p.step}>
                <span className="font-display text-4xl font-bold text-primary/30">{p.step}</span>
                <h3 className="mt-2 font-semibold">{p.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="container py-24 text-center">
        <h2 className="font-display text-3xl font-bold sm:text-4xl">Ready to fuel your training?</h2>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          Submit your intake and I'll personally review it — or message me directly on WhatsApp.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="/intake">
              Start your intake <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <WhatsAppButton />
        </div>
        <a href={`mailto:${BRAND.email}`} className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <Mail className="h-4 w-4" /> {BRAND.email}
        </a>
      </section>

      <footer className="border-t border-border py-10">
        <div className="container flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
          <BrandMark />
          <div className="flex gap-6">
            <Link href="/login">Coach login</Link>
            <Link href="/intake">Client intake</Link>
            <a href={BRAND.whatsappHref} target="_blank" rel="noopener noreferrer">WhatsApp</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
