import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Shield,
  DollarSign,
  FileEdit,
  Zap,
  Lock,
  BarChart3,
  Users,
  CheckCircle,
  Sparkles,
  Clock,
  TrendingUp,
  FileText,
  Star,
  Leaf
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import ParticleMesh from "@/components/landing/ParticleMesh";
import Header from "@/components/landing/Header";
import TestimonialCard from "@/components/landing/TestimonialCard";

const testimonials = [
  {
    quote: "AuditEase reduced our contract review time by 85%. What used to take our legal team days now happens in minutes with higher accuracy.",
    author: "Sarah Chen",
    role: "General Counsel",
    company: "TechFlow Inc.",
    rating: 5,
  },
  {
    quote: "The liability calculator alone has saved us millions. We now catch compliance gaps before they become costly legal issues.",
    author: "Michael Torres",
    role: "VP of Legal Operations",
    company: "GlobalBank",
    rating: 5,
  },
  {
    quote: "Finally, a compliance tool that actually understands the nuances of regulatory requirements. The AI rewrites are remarkably accurate.",
    author: "Emily Watson",
    role: "Chief Compliance Officer",
    company: "HealthFirst",
    rating: 5,
  },
];

const companyLogos = [
  "TechFlow", "GlobalBank", "HealthFirst", "LegalPro", "DataCorp", "SecureNet"
];

const Index = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  const pricingPlans = [
    {
      name: "Starter",
      monthlyPrice: 0,
      description: "Essential compliance tools for small teams.",
      features: [
        "5 Document Audits/mo",
        "Basic Compliance Standards",
        "PDF Export",
        "Email Support",
      ],
      cta: "Start Free Trial",
      popular: false,
    },
    {
      name: "Professional",
      monthlyPrice: 49,
      description: "Advanced AI analysis for growing legal teams.",
      features: [
        "Unlimited Audits",
        "Advanced Gap Analysis",
        "Chat with Contract (AI)",
        "Version Comparison",
        "Priority Support",
        "Custom Standards",
      ],
      cta: "Start Free Trial",
      popular: true,
    },
    {
      name: "Enterprise",
      monthlyPrice: null,
      description: "Full-scale automation for large organizations.",
      features: [
        "Dedicated Success Manager",
        "API Access",
        "SSO & Advanced Security",
        "Custom AI Model Training",
        "SLA & Audit Logs",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  const getPrice = (monthlyPrice: number | null) => {
    if (monthlyPrice === null) return "Custom";
    if (isAnnual) {
      return `$${Math.round(monthlyPrice * 0.8)}`;
    }
    return `$${monthlyPrice}`;
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <ParticleMesh />
      <Header />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Hero Section */}
        <main className="relative flex flex-1 flex-col items-center justify-center px-6 pb-16 pt-28 text-center lg:pt-36">
          {/* Badge */}
          <div className="mb-8 animate-fade-in">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-5 py-2.5 text-sm font-medium text-emerald-400 backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              Introducing AuditEase Enterprise 2.0
            </span>
          </div>

          {/* Headline */}
          <h1 className="mb-6 max-w-4xl animate-slide-up text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
            Stop Losing Money to{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent">
                Compliance Gaps
              </span>
              <svg className="absolute -bottom-1 left-0 w-full sm:-bottom-2" height="8" viewBox="0 0 200 8" fill="none" preserveAspectRatio="none">
                <path d="M2 6C50 2 150 2 198 6" stroke="url(#underline-gradient)" strokeWidth="3" strokeLinecap="round" />
                <defs>
                  <linearGradient id="underline-gradient" x1="0" y1="0" x2="200" y2="0">
                    <stop stopColor="#10b981" />
                    <stop offset="1" stopColor="#14b8a6" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="mb-10 max-w-2xl animate-slide-up text-base text-gray-300 sm:text-lg lg:text-xl"
            style={{ animationDelay: "0.1s" }}
          >
            AI-powered contract analysis that identifies regulatory risks,
            estimates liability exposure, and generates compliant rewrites—all in under 60 seconds.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-4 animate-slide-up items-center justify-center sm:flex-row" style={{ animationDelay: "0.2s" }}>
            <Button
              asChild
              size="lg"
              className="group gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-6 text-lg font-semibold text-white shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all hover:shadow-[0_0_50px_rgba(16,185,129,0.5)]"
            >
              <Link to="/auth">
                Start Free Trial
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-10 animate-slide-up flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400" style={{ animationDelay: "0.3s" }}>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span>SOC 2 certified</span>
            </div>
          </div>

          {/* Quick Stats Row */}
          <div
            className="mt-14 animate-slide-up grid w-full max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4"
            style={{ animationDelay: "0.4s" }}
          >
            {[
              { icon: Clock, value: "<60s", label: "Analysis Time" },
              { icon: FileText, value: "50K+", label: "Contracts" },
              { icon: TrendingUp, value: "94%", label: "Risk Reduction" },
              { icon: DollarSign, value: "$2.4M", label: "Avg. Savings/yr" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center rounded-xl border border-emerald-500/20 bg-slate-800/30 px-4 py-4 backdrop-blur-sm hover:border-emerald-500/40 transition-colors"
              >
                <stat.icon className="mb-2 h-5 w-5 text-emerald-400" />
                <span className="text-lg font-bold text-white sm:text-xl">{stat.value}</span>
                <span className="text-xs text-gray-400">{stat.label}</span>
              </div>
            ))}
          </div>
        </main>

        {/* Logos Section */}
        <section className="border-y border-slate-800/50 bg-slate-900/30 px-6 py-12 backdrop-blur-sm">
          <div className="mx-auto max-w-5xl">
            <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-gray-500">
              Trusted by legal teams at leading companies
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
              {companyLogos.map((logo) => (
                <div
                  key={logo}
                  className="text-xl font-bold text-gray-600 transition-colors hover:text-emerald-400"
                >
                  {logo}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Cards */}
        <section id="features" className="px-6 py-24">
          <div className="mx-auto max-w-5xl">
            <div className="mb-16 text-center">
              <span className="mb-4 inline-block rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1 text-sm font-medium text-emerald-400">
                Features
              </span>
              <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
                Everything You Need for{" "}
                <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Compliance Excellence</span>
              </h2>
              <p className="mx-auto max-w-2xl text-gray-400">
                Powerful AI tools designed specifically for legal and compliance professionals
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              {[
                {
                  icon: Shield,
                  title: "Instant Risk Detection",
                  description:
                    "Upload any contract and identify compliance gaps against GDPR, CCPA, HIPAA, and 50+ regulatory frameworks in seconds.",
                },
                {
                  icon: Zap,
                  title: "Chat with Contract",
                  description:
                    "Ask questions about your documents in plain English. Our AI understands context, liability, and obligations instantly.",
                },
                {
                  icon: FileEdit,
                  title: "Smart Auto-Redline",
                  description:
                    "Generate compliant clause rewrites with tracked changes. Ready for negotiation and review.",
                },
              ].map((feature, i) => (
                <div
                  key={feature.title}
                  className="group animate-slide-up relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-slate-900/50 p-8 backdrop-blur-md transition-all duration-300 hover:border-emerald-400/50 hover:bg-slate-900/70"
                  style={{ animationDelay: `${0.3 + i * 0.1}s` }}
                >
                  {/* Gradient hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 opacity-0 transition-opacity group-hover:opacity-100" />

                  <div className="relative">
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400 transition-colors group-hover:from-emerald-500/30 group-hover:to-teal-500/30">
                      <feature.icon className="h-7 w-7" />
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-white">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-5xl">
            <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-slate-900/80 to-slate-800/50 p-8 backdrop-blur-md sm:p-12">
              <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
                {[
                  { value: "99.2%", label: "Accuracy Rate", suffix: "" },
                  { value: "60", label: "Second Analysis", suffix: "s" },
                  { value: "50K", label: "Contracts Analyzed", suffix: "+" },
                  { value: "200", label: "Enterprise Clients", suffix: "+" },
                ].map((stat, i) => (
                  <div
                    key={stat.label}
                    className="animate-slide-up text-center"
                    style={{ animationDelay: `${0.5 + i * 0.1}s` }}
                  >
                    <div className="mb-2 text-3xl font-bold sm:text-5xl">
                      <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                        {stat.value}
                      </span>
                      <span className="text-emerald-400">{stat.suffix}</span>
                    </div>
                    <div className="text-sm text-gray-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="px-6 py-24">
          <div className="mx-auto max-w-5xl">
            <div className="mb-16 text-center">
              <span className="mb-4 inline-block rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1 text-sm font-medium text-emerald-400">
                How It Works
              </span>
              <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
                Three Steps to{" "}
                <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Complete Compliance</span>
              </h2>
              <p className="mx-auto max-w-2xl text-gray-400">
                Our streamlined process makes compliance auditing effortless
              </p>
            </div>

            <div className="relative">
              {/* Connection Line */}
              <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-emerald-500/50 via-emerald-500/20 to-transparent sm:block" />

              <div className="grid gap-12 sm:grid-cols-3">
                {[
                  {
                    step: "01",
                    icon: Zap,
                    title: "Upload Documents",
                    description: "Drag and drop your contracts or select from your document vault. We support PDF, DOCX, and more.",
                  },
                  {
                    step: "02",
                    icon: BarChart3,
                    title: "AI Analysis",
                    description: "Our AI scans every clause against 50+ regulatory frameworks and identifies gaps in real-time.",
                  },
                  {
                    step: "03",
                    icon: CheckCircle,
                    title: "Review & Apply",
                    description: "Get detailed reports with risk scores, liability estimates, and one-click compliant rewrites.",
                  },
                ].map((item, i) => (
                  <div
                    key={item.title}
                    className="animate-slide-up relative text-center"
                    style={{ animationDelay: `${0.6 + i * 0.1}s` }}
                  >
                    {/* Step Number */}
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-2xl font-bold text-emerald-400">
                      {item.step}
                    </div>

                    <div className="mb-4 flex justify-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800/50 text-emerald-400">
                        <item.icon className="h-6 w-6" />
                      </div>
                    </div>

                    <h3 className="mb-3 text-xl font-semibold text-white">{item.title}</h3>
                    <p className="text-gray-400">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="px-6 py-24">
          <div className="mx-auto max-w-5xl">
            <div className="mb-16 text-center">
              <span className="mb-4 inline-block rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1 text-sm font-medium text-emerald-400">
                Testimonials
              </span>
              <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
                Loved by{" "}
                <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Legal Teams Worldwide</span>
              </h2>
              <p className="mx-auto max-w-2xl text-gray-400">
                See what compliance professionals are saying about AuditEase
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {testimonials.map((testimonial, i) => (
                <TestimonialCard
                  key={testimonial.author}
                  {...testimonial}
                  delay={`${0.3 + i * 0.15}s`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <span className="mb-4 inline-block rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1 text-sm font-medium text-emerald-400">
                Pricing
              </span>
              <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
                Simple, Transparent{" "}
                <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Pricing</span>
              </h2>
              <p className="mx-auto max-w-2xl text-gray-400">
                Choose the plan that fits your team's needs. All plans include a 14-day free trial.
              </p>
            </div>

            {/* Billing Toggle */}
            <div className="mb-12 flex items-center justify-center gap-4">
              <span className={`text-sm font-medium transition-colors ${!isAnnual ? 'text-white' : 'text-gray-400'}`}>
                Monthly
              </span>
              <Switch
                checked={isAnnual}
                onCheckedChange={setIsAnnual}
                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-emerald-500 data-[state=checked]:to-teal-500"
              />
              <span className={`text-sm font-medium transition-colors ${isAnnual ? 'text-white' : 'text-gray-400'}`}>
                Annual
              </span>
              {isAnnual && (
                <span className="ml-2 rounded-full bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-400">
                  Save 20%
                </span>
              )}
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              {pricingPlans.map((plan, i) => (
                <div
                  key={plan.name}
                  className={`animate-slide-up relative rounded-2xl border p-8 backdrop-blur-md transition-all duration-300 cursor-pointer
                    hover:scale-105 hover:-translate-y-2 ${plan.popular
                      ? "border-emerald-500/50 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 lg:scale-105 shadow-[0_0_40px_rgba(16,185,129,0.15)] hover:shadow-[0_0_60px_rgba(16,185,129,0.25)]"
                      : "border-slate-700/50 bg-slate-900/50 hover:border-emerald-500/30 hover:shadow-[0_20px_50px_rgba(16,185,129,0.1)]"
                    }`}
                  style={{ animationDelay: `${0.2 + i * 0.1}s` }}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-1.5 text-sm font-semibold text-white shadow-lg">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="mb-2 text-xl font-semibold text-white">{plan.name}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{plan.description}</p>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-white">{getPrice(plan.monthlyPrice)}</span>
                      {plan.monthlyPrice !== null && (
                        <span className="text-gray-400">/{isAnnual ? 'month' : 'mo'}</span>
                      )}
                    </div>
                    {plan.monthlyPrice !== null && isAnnual && (
                      <p className="mt-1 text-sm text-emerald-400">
                        Billed annually (${Math.round(plan.monthlyPrice * 0.8 * 12)}/year)
                      </p>
                    )}
                  </div>

                  <ul className="mb-8 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm text-gray-300">
                        <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    asChild
                    className={`w-full py-6 font-semibold transition-all ${plan.popular
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                      : "border-slate-600 bg-slate-800 text-white hover:bg-slate-700"
                      }`}
                    variant={plan.popular ? "default" : "outline"}
                  >
                    <Link to="/auth">{plan.cta}</Link>
                  </Button>
                </div>
              ))}
            </div>

            {/* Trust badges */}
            <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400">
              {[
                { icon: Lock, text: "SOC 2 Type II Certified" },
                { icon: Shield, text: "GDPR Compliant" },
                { icon: Star, text: "4.9/5 on G2 Reviews" },
                { icon: Users, text: "24/7 Support" },
              ].map((badge) => (
                <div key={badge.text} className="flex items-center gap-2 transition-colors hover:text-emerald-400">
                  <badge.icon className="h-4 w-4 text-emerald-400" />
                  {badge.text}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-24">
          <div className="mx-auto max-w-4xl">
            <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-slate-900 via-slate-800/80 to-slate-900 p-8 sm:p-16">
              {/* Background Effects */}
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl" />

              <div className="relative text-center">
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-emerald-500/10 p-3">
                    <Leaf className="h-8 w-8 text-emerald-400" />
                  </div>
                </div>
                <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
                  Ready to Eliminate Compliance Risk?
                </h2>
                <p className="mx-auto mb-8 max-w-xl text-gray-400">
                  Join 200+ enterprise legal teams who trust AuditEase to protect their organizations.
                </p>

                <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="group gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 px-10 py-6 text-lg font-semibold text-white shadow-[0_0_40px_rgba(16,185,129,0.3)] transition-all hover:shadow-[0_0_60px_rgba(16,185,129,0.5)]"
                  >
                    <Link to="/auth">
                      Start Your Free Trial
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                  <p className="text-sm text-gray-500">
                    No credit card required • 14 days free
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-800/50 px-6 py-12">
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold text-white">AuditEase</span>
              </div>

              <nav className="flex flex-wrap gap-6 text-sm text-gray-400">
                <a href="#" className="hover:text-emerald-400 transition-colors">Privacy</a>
                <a href="#" className="hover:text-emerald-400 transition-colors">Terms</a>
                <a href="#" className="hover:text-emerald-400 transition-colors">Security</a>
                <a href="#" className="hover:text-emerald-400 transition-colors">Contact</a>
              </nav>

              <p className="text-sm text-gray-500">
                © 2026 AuditEase. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
