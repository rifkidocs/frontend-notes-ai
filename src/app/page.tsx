'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import {
  FileText,
  Sparkles,
  Zap,
  Shield,
  Users,
  Clock,
  Check,
  ArrowRight,
  Star,
  Github,
  Twitter,
  ChevronRight,
  Command,
  Keyboard,
  MousePointer2,
  Brain,
  Globe,
  Lock,
  MessageSquare,
  type LucideIcon,
} from 'lucide-react';
import { authApi } from '@/lib/api/auth';
import { MotionButton, MotionCard } from '@/components/motion';
import Link from 'next/link';

// Testimonial data
const testimonials = [
  {
    quote: "Notes AI has completely transformed how our team collaborates. The AI suggestions are incredibly helpful and the real-time sync is flawless.",
    author: "Sarah Chen",
    role: "Product Lead, Stripe",
    avatar: "SC",
    rating: 5,
  },
  {
    quote: "Finally, a note-taking app that understands how writers think. The AI assistant feels like having a brilliant co-writer.",
    author: "Marcus Johnson",
    role: "Bestselling Author",
    avatar: "MJ",
    rating: 5,
  },
  {
    quote: "We migrated our entire company to Notes AI. The security features and enterprise support are outstanding.",
    author: "Emily Rodriguez",
    role: "CTO, TechCorp",
    avatar: "ER",
    rating: 5,
  },
];

// Trusted companies
const trustedCompanies = [
  { name: "Google", icon: "G" },
  { name: "Microsoft", icon: "M" },
  { name: "Stripe", icon: "S" },
  { name: "Shopify", icon: "⊕" },
  { name: "Notion", icon: "N" },
];

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 20,
    },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

// Feature cards with icons
const features = [
  {
    icon: Brain,
    title: "AI-Powered Intelligence",
    description: "Advanced AI that understands context, suggests improvements, and helps you write better. From grammar checks to idea generation.",
    gradient: "from-violet-500/20 to-violet-500/5",
    iconGradient: "from-violet-500 to-purple-600",
  },
  {
    icon: Users,
    title: "Real-Time Collaboration",
    description: "Work together seamlessly with your team. See cursors, edits, and comments in real-time. Built for modern distributed teams.",
    gradient: "from-blue-500/20 to-blue-500/5",
    iconGradient: "from-blue-500 to-cyan-600",
  },
  {
    icon: Zap,
    title: "Lightning Performance",
    description: "Built for speed with sub-100ms load times. Instant sync across all devices. Your ideas, available everywhere, always.",
    gradient: "from-amber-500/20 to-amber-500/5",
    iconGradient: "from-amber-500 to-orange-600",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-level encryption, SOC 2 Type II certified, GDPR compliant. Your data is protected with the highest security standards.",
    gradient: "from-emerald-500/20 to-emerald-500/5",
    iconGradient: "from-emerald-500 to-green-600",
  },
  {
    icon: Command,
    title: "Powerful Integrations",
    description: "Connect with 100+ tools you already use. Slack, GitHub, Figma, and more. Automate your workflow effortlessly.",
    gradient: "from-pink-500/20 to-pink-500/5",
    iconGradient: "from-pink-500 to-rose-600",
  },
  {
    icon: Clock,
    title: "Version History",
    description: "Never lose work again. Automatic backups with full version history. Restore any previous version with one click.",
    gradient: "from-indigo-500/20 to-indigo-500/5",
    iconGradient: "from-indigo-500 to-blue-600",
  },
];

// Keyboard shortcuts showcase
const shortcuts = [
  { keys: ["⌘", "K"], label: "Quick Search" },
  { keys: ["⌘", "N"], label: "New Note" },
  { keys: ["⌘", "/"], label: "AI Assistant" },
  { keys: ["⌘", "S"], label: "Save" },
];

export default function Home() {
  const router = useRouter();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useSpring(useTransform(scrollY, [0, 500], [1, 0.8]), { stiffness: 100, damping: 30 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (authApi.isAuthenticated()) {
      router.replace('/dashboard');
    }

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [router]);

  const handleGetStarted = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Advanced Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Multiple gradient orbs */}
        <motion.div
          style={{ y, opacity }}
          className="absolute top-20 left-1/4 w-96 h-96 bg-primary/15 rounded-full blur-[140px]"
        />
        <motion.div
          style={{ y: useTransform(scrollY, [0, 500], [0, -150]), opacity }}
          className="absolute bottom-20 right-1/4 w-96 h-96 bg-accent/15 rounded-full blur-[140px]"
        />
        <motion.div
          style={{ scale }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-start/10 rounded-full blur-[180px]"
        />

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:64px_64px]" />

        {/* Noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }} />

        {/* Mouse-following glow */}
        <motion.div
          className="fixed w-96 h-96 rounded-full bg-primary/5 blur-[100px] pointer-events-none"
          animate={{
            x: mousePosition.x - 192,
            y: mousePosition.y - 192,
          }}
          transition={{ type: 'spring', stiffness: 150, damping: 20 }}
        />
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100 }}
        className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-border/50 backdrop-blur-xl"
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-3"
            >
              <motion.div
                className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30"
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <FileText className="h-5 w-5 text-primary-foreground" />
              </motion.div>
              <span className="font-bold text-xl hidden sm:block">Notes AI</span>
            </button>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group">
                Features
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
              </a>
              <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group">
                How it Works
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
              </a>
              <a href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group">
                Testimonials
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
              </a>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/login" className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Sign In
              </Link>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <MotionButton size="sm" onClick={handleGetStarted}>
                  Get Started Free
                </MotionButton>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-32 px-6">
        <div className="container mx-auto">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="max-w-6xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="h-4 w-4 text-primary" />
              </motion.div>
              <span className="text-sm font-medium text-primary">Introducing Notes AI 2.0 - Now with GPT-4 Integration</span>
              <ChevronRight className="h-4 w-4 text-primary" />
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              variants={fadeInUp}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight tracking-tight"
            >
              Where Ideas Meet
              <span className="block mt-2">
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient">
                  Intelligence
                </span>
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fadeInUp}
              className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed"
            >
              The next-generation note-taking platform powered by AI. Write smarter,
              collaborate seamlessly, and never lose a brilliant idea again.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            >
              <MotionButton
                size="lg"
                onClick={handleGetStarted}
                className="gap-2 shadow-2xl shadow-primary/30 text-base px-8 py-6 h-auto"
              >
                Start Writing for Free
                <ArrowRight className="h-4 w-4" />
              </MotionButton>
              <MotionButton
                variant="outline"
                size="lg"
                onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
                className="gap-2 text-base px-8 py-6 h-auto hover:bg-muted hover:text-muted-foreground hover:border-muted-foreground/20 transition-all"
              >
                <Play className="h-4 w-4" />
                Watch Demo
              </MotionButton>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-col items-center gap-6"
            >
              {/* Stars */}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.div
                    key={star}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 + star * 0.1 }}
                  >
                    <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                  </motion.div>
                ))}
              </div>
              <p className="text-base text-muted-foreground">
                Loved by <span className="font-semibold text-foreground">50,000+</span> writers and teams worldwide
              </p>

              {/* Trusted Companies */}
              <div className="w-full max-w-3xl">
                <p className="text-xs text-muted-foreground text-center mb-4 uppercase tracking-wider">
                  Trusted by teams at
                </p>
                <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
                  {trustedCompanies.map((company, index) => (
                    <motion.div
                      key={company.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="text-2xl font-bold text-muted-foreground/40 hover:text-muted-foreground transition-colors cursor-pointer"
                    >
                      {company.icon}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Product Demo Section */}
      <section id="demo" className="py-20 px-6 relative">
        <div className="container mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="relative max-w-6xl mx-auto">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-3xl blur-3xl" />

              {/* Browser mockup */}
              <MotionCard variant="glass" className="relative p-2 rounded-2xl shadow-2xl">
                {/* Browser header */}
                <div className="bg-muted/50 rounded-xl p-4 flex items-center gap-2 mb-4">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="bg-background rounded-lg px-4 py-2 text-sm text-muted-foreground text-center">
                      app.notes.ai/dashboard
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="bg-background rounded-xl p-8 min-h-[400px]">
                  {/* Mock editor UI */}
                  <div className="grid grid-cols-3 gap-6">
                    {/* Sidebar */}
                    <div className="space-y-3">
                      <div className="h-8 w-3/4 bg-muted rounded-lg animate-pulse" />
                      <div className="h-6 w-full bg-muted/50 rounded-lg" />
                      <div className="h-6 w-5/6 bg-muted/50 rounded-lg" />
                      <div className="h-6 w-4/6 bg-muted/50 rounded-lg" />
                    </div>

                    {/* Editor */}
                    <div className="col-span-2 space-y-4">
                      <div className="h-12 w-2/3 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg animate-pulse" />
                      <div className="space-y-2">
                        <div className="h-4 w-full bg-muted/30 rounded" />
                        <div className="h-4 w-full bg-muted/30 rounded" />
                        <div className="h-4 w-5/6 bg-muted/30 rounded" />
                        <div className="h-4 w-4/6 bg-muted/30 rounded" />
                      </div>

                      {/* AI suggestion */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1, duration: 0.5 }}
                        className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-primary/20"
                      >
                        <div className="flex items-start gap-3">
                          <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-primary mb-1">AI Suggestion</p>
                            <p className="text-sm text-muted-foreground">
                              Consider adding more detail to this section to improve clarity...
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </MotionCard>

              {/* Floating elements */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute -right-8 top-20 bg-background border-2 border-border rounded-xl p-4 shadow-xl"
              >
                <Keyboard className="h-8 w-8 text-primary mb-2" />
                <p className="text-xs font-medium mb-1">Keyboard Shortcuts</p>
                <div className="space-y-1">
                  {shortcuts.slice(0, 2).map((shortcut) => (
                    <div key={shortcut.label} className="flex items-center gap-2 text-xs text-muted-foreground">
                      {shortcut.keys.map((key, i) => (
                        <span key={i} className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">
                          {key}
                        </span>
                      ))}
                      <span>{shortcut.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="absolute -left-8 bottom-20 bg-background border-2 border-border rounded-xl p-4 shadow-xl"
              >
                <Users className="h-8 w-8 text-accent mb-2" />
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent border-2 border-background" />
                  ))}
                </div>
                <p className="text-xs font-medium mt-2">3 collaborators</p>
                <p className="text-xs text-muted-foreground">Active now</p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 relative bg-muted/20">
        <div className="container mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
            className="max-w-7xl mx-auto"
          >
            {/* Section Header */}
            <motion.div variants={fadeInUp} className="text-center mb-20">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent mb-6 shadow-lg shadow-primary/25"
              >
                <Sparkles className="h-8 w-8 text-primary-foreground" />
              </motion.div>
              <h2 className="text-4xl md:text-6xl font-bold mb-6">
                Everything you need to
                <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  write brilliantly
                </span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Powerful features designed to help you capture ideas, collaborate with your team,
                and create your best work.
              </p>
            </motion.div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <MotionCard
                  key={feature.title}
                  variant="glass"
                  index={index}
                  className="group p-8 hover:border-primary/30 transition-all duration-300"
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-8 w-8 text-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>

                  {/* Hover effect line */}
                  <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-gradient-to-r from-primary to-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </MotionCard>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works - Enhanced Design */}
      <section id="how-it-works" className="py-32 px-6 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
            className="max-w-6xl mx-auto"
          >
            {/* Section header with badge */}
            <motion.div variants={fadeInUp} className="text-center mb-20">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6"
              >
                <Zap className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium text-accent">Quick & Easy Setup</span>
              </motion.div>
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
                Get started in
                <span className="block mt-2">
                  <span className="bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient">
                    minutes, not hours
                  </span>
                </span>
              </h2>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                No complicated setup. No credit card required. Just sign up and start writing.
              </p>
            </motion.div>

            {/* Enhanced step cards with diagonal flow */}
            <div className="relative">
              {[
                {
                  step: '01',
                  icon: Users,
                  title: 'Create Your Account',
                  description: 'Sign up in seconds with Google, GitHub, or email. Your account is ready instantly.',
                  gradient: 'from-primary/20 to-primary/5',
                  iconBg: 'from-primary to-violet-600',
                },
                {
                  step: '02',
                  icon: FileText,
                  title: 'Write Your First Note',
                  description: 'Start with a blank page or choose from beautiful templates. AI helps you along the way.',
                  gradient: 'from-accent/20 to-accent/5',
                  iconBg: 'from-accent to-pink-600',
                },
                {
                  step: '03',
                  icon: Globe,
                  title: 'Share & Collaborate',
                  description: 'Invite your team, share notes, and work together in real-time from anywhere.',
                  gradient: 'from-emerald-500/20 to-emerald-500/5',
                  iconBg: 'from-emerald-500 to-green-600',
                },
              ].map((step, index) => (
                <motion.div
                  key={step.step}
                  variants={fadeInUp}
                  className="relative z-10 group"
                >
                  <motion.div
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="relative"
                  >
                    {/* Floating step number - Outside card with higher z-index */}
                    <motion.div
                      animate={{
                        y: [0, -10, 0],
                        rotate: [0, 5, 0],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        delay: index * 0.5,
                        ease: 'easeInOut'
                      }}
                      className="absolute -top-4 -right-4 z-50 w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold text-primary-foreground shadow-2xl shadow-primary/30 border-4 border-background"
                    >
                      {step.step}
                    </motion.div>

                    {/* Glass card with gradient border */}
                    <div className="absolute inset-0 bg-gradient-to-br from-border/50 to-border/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500" />
                    <div className="relative glass-card rounded-3xl p-8 md:p-10 h-full overflow-hidden">
                      {/* Animated gradient background on hover */}
                      <motion.div
                        className={`absolute inset-0 bg-gradient-to-br ${step.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                      />

                      <div className="relative">
                        {/* Icon with glow */}
                        <div className="relative inline-block mb-6">
                          <motion.div
                            animate={{
                              boxShadow: [
                                `0 0 20px -5px oklch(from var(--primary) l c h / 0.3)`,
                                `0 0 40px -5px oklch(from var(--primary) l c h / 0.5)`,
                                `0 0 20px -5px oklch(from var(--primary) l c h / 0.3)`,
                              ]
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              delay: index * 0.3,
                            }}
                            className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${step.iconBg} flex items-center justify-center`}
                          >
                            <step.icon className="h-10 w-10 text-white" />
                          </motion.div>
                        </div>

                        <h3 className="text-2xl md:text-3xl font-bold mb-4 group-hover:text-primary transition-colors">
                          {step.title}
                        </h3>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                          {step.description}
                        </p>

                        {/* Animated arrow on hover */}
                        <motion.div
                          initial={false}
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="mt-6 flex items-center gap-2 text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <span className="text-sm">Let's go</span>
                          <ArrowRight className="h-4 w-4" />
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>

            {/* Bottom CTA for this section */}
            <motion.div
              variants={fadeInUp}
              className="text-center mt-16"
            >
              <MotionButton
                size="lg"
                onClick={handleGetStarted}
                className="gap-2 shadow-2xl shadow-primary/30 text-base px-10 py-6 h-auto"
              >
                Start Your Journey Now
                <ArrowRight className="h-5 w-5" />
              </MotionButton>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-32 px-6 relative bg-muted/20">
        <div className="container mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
            className="max-w-7xl mx-auto"
          >
            <motion.div variants={fadeInUp} className="text-center mb-20">
              <h2 className="text-4xl md:text-6xl font-bold mb-6">
                Loved by
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {' '}thousands of writers
                </span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                See what our customers have to say about their experience
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <MotionCard
                  key={testimonial.author}
                  variant="glass"
                  index={index}
                  className="p-8"
                >
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  <p className="text-lg mb-6 leading-relaxed">"{testimonial.quote}"</p>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.author}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </MotionCard>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 relative">
        <div className="container mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
          >
            <motion.div
              variants={fadeInUp}
              className="max-w-5xl mx-auto p-12 md:p-20 text-center relative overflow-hidden"
            >
              {/* Background with gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-primary opacity-90" />
              <div className="absolute inset-0 bg-background/95" />

              {/* Content */}
              <div className="relative z-10">
                <motion.h2
                  variants={fadeInUp}
                  className="text-4xl md:text-6xl font-bold mb-6"
                >
                  Ready to transform your
                  <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    writing experience?
                  </span>
                </motion.h2>

                <motion.p
                  variants={fadeInUp}
                  className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
                >
                  Join 50,000+ writers who are already creating their best work with Notes AI.
                  Start your free trial today.
                </motion.p>

                <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <MotionButton
                    size="lg"
                    onClick={handleGetStarted}
                    className="gap-2 text-lg px-10 py-6 h-auto shadow-2xl shadow-primary/30"
                  >
                    Get Started for Free
                    <ArrowRight className="h-5 w-5" />
                  </MotionButton>
                  <MotionButton
                    variant="outline"
                    size="lg"
                    className="gap-2 text-lg px-10 py-6 h-auto hover:bg-muted hover:text-muted-foreground hover:border-muted-foreground/20 transition-all"
                    onClick={() => window.open('https://github.com', '_blank')}
                  >
                    <Github className="h-5 w-5" />
                    Star on GitHub
                  </MotionButton>
                </motion.div>

                <motion.p
                  variants={fadeInUp}
                  className="text-sm text-muted-foreground mt-8"
                >
                  No credit card required · Free forever plan available · Cancel anytime
                </motion.p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer - Enhanced Responsive Design */}
      <footer className="relative border-t border-border/30 bg-muted/5 overflow-hidden">
        {/* Decorative gradient overlays */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-1/3 h-full bg-gradient-to-r from-accent/5 to-transparent pointer-events-none" />

        <div className="container mx-auto px-6 py-16">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-12 lg:gap-12 mb-16">
            {/* Brand - Full width on mobile, 2 cols on desktop */}
            <div className="col-span-2 lg:col-span-2">
              <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
                <motion.div
                  className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FileText className="h-6 w-6 text-primary-foreground" />
                </motion.div>
                <span className="font-bold text-2xl group-hover:text-primary transition-colors">Notes AI</span>
              </Link>
              <p className="text-muted-foreground mb-8 max-w-md leading-relaxed">
                The next-generation note-taking platform powered by AI. Where ideas meet intelligence.
              </p>

              {/* Social links with enhanced hover */}
              <div className="flex items-center gap-3">
                <motion.a
                  href="#"
                  aria-label="Twitter"
                  className="group relative w-11 h-11 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground overflow-hidden"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Twitter className="h-5 w-5 relative z-10" />
                </motion.a>
                <motion.a
                  href="#"
                  aria-label="GitHub"
                  className="group relative w-11 h-11 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground overflow-hidden"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Github className="h-5 w-5 relative z-10" />
                </motion.a>
                <motion.a
                  href="#"
                  aria-label="Discord"
                  className="group relative w-11 h-11 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground overflow-hidden"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <MessageSquare className="h-5 w-5 relative z-10" />
                </motion.a>
              </div>
            </div>

            {/* Product links */}
            <div className="col-span-1">
              <h4 className="font-semibold mb-5 text-foreground">Product</h4>
              <ul className="space-y-4">
                <li>
                  <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/0 group-hover:bg-primary transition-colors" />
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/0 group-hover:bg-primary transition-colors" />
                    Templates
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/0 group-hover:bg-primary transition-colors" />
                    Integrations
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/0 group-hover:bg-primary transition-colors" />
                    Changelog
                  </a>
                </li>
              </ul>
            </div>

            {/* Company links */}
            <div className="col-span-1">
              <h4 className="font-semibold mb-5 text-foreground">Company</h4>
              <ul className="space-y-4">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/0 group-hover:bg-primary transition-colors" />
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/0 group-hover:bg-primary transition-colors" />
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/0 group-hover:bg-primary transition-colors" />
                    Careers
                    <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Hiring</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/0 group-hover:bg-primary transition-colors" />
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal links */}
            <div className="col-span-1">
              <h4 className="font-semibold mb-5 text-foreground">Legal</h4>
              <ul className="space-y-4">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/0 group-hover:bg-primary transition-colors" />
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/0 group-hover:bg-primary transition-colors" />
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/0 group-hover:bg-primary transition-colors" />
                    Security
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom section - enhanced responsive layout */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-border/30">
            <p className="text-sm text-muted-foreground text-center sm:text-left">
              © 2025 Notes AI. Crafted with care for writers everywhere.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Status</a>
              <a href="#" className="hover:text-foreground transition-colors">GitHub</a>
              <a href="#" className="hover:text-foreground transition-colors">Twitter</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Play icon component
function Play({ className }: { className?: string }) {
  return (
    <svg
      fill="currentColor"
      viewBox="0 0 24 24"
      className={className}
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
