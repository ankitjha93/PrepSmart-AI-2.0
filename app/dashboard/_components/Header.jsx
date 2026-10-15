"use client";

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from 'next-themes';
import moment from 'moment';
import { 
  LogOut, 
  Sparkles, 
  ChevronDown, 
  LayoutDashboard, 
  Layers, 
  PlayCircle, 
  Menu, 
  X, 
  ArrowRight,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Crown,
  Settings,
  Sun,
  Moon,
  Sliders,
  Cpu,
  Flame,
  Award,
  Zap
} from 'lucide-react';
import AccountSettingsDialog from '@/components/AccountSettingsDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { OllamaService } from '@/utils/OllamaAIModal';
import { db } from '@/utils/db';
import { MockInterview, UserAnswer } from '@/utils/schema';
import { eq } from 'drizzle-orm';

function Header() {
  const path = usePathname();
  const headerRef = useRef(null);
  const { user, signOut, isDemoUser } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState({ online: false, model: 'llama3.3' });
  const [candidateMiniStats, setCandidateMiniStats] = useState({ score: '—', streak: 0 });
  const dropdownRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    OllamaService.checkStatus().then((status) => {
      setOllamaStatus({
        online: Boolean(status.online),
        model: status.activeModel || status.model || 'llama3.3',
      });
    });
  }, []);

  // Fetch real candidate mini stats for user menu
  useEffect(() => {
    const userEmail = user?.email || user?.primaryEmailAddress?.emailAddress;
    if (!userEmail) return;

    const loadMiniStats = async () => {
      try {
        const [interviews, answers] = await Promise.all([
          db.select().from(MockInterview).where(eq(MockInterview.createdBy, userEmail)),
          db.select().from(UserAnswer).where(eq(UserAnswer.userEmail, userEmail))
        ]);

        let calculatedAvg = '—';
        if (answers && answers.length > 0) {
          const valid = answers.map((a) => parseFloat(a.rating)).filter((r) => !isNaN(r) && r > 0);
          if (valid.length > 0) {
            calculatedAvg = (valid.reduce((acc, curr) => acc + curr, 0) / valid.length).toFixed(1);
          }
        }

        // Calculate consecutive streak
        const activeDatesSet = new Set();
        const normalizeToKey = (dateStr) => {
          if (!dateStr) return null;
          const m = moment(dateStr, ['DD-MM-YYYY', 'YYYY-MM-DD', 'DD/MM/YYYY', moment.ISO_8601], true);
          return m.isValid() ? m.format('YYYY-MM-DD') : null;
        };
        (answers || []).forEach((a) => {
          const k = normalizeToKey(a.createdAt);
          if (k) activeDatesSet.add(k);
        });
        (interviews || []).forEach((i) => {
          const k = normalizeToKey(i.createdAt);
          if (k) activeDatesSet.add(k);
        });

        const todayKey = moment().format('YYYY-MM-DD');
        const yesterdayKey = moment().subtract(1, 'day').format('YYYY-MM-DD');
        let streak = 0;
        let checkDate = null;
        if (activeDatesSet.has(todayKey)) checkDate = moment();
        else if (activeDatesSet.has(yesterdayKey)) checkDate = moment().subtract(1, 'day');

        if (checkDate) {
          while (activeDatesSet.has(checkDate.format('YYYY-MM-DD'))) {
            streak++;
            checkDate.subtract(1, 'day');
          }
        }

        setCandidateMiniStats({ score: calculatedAvg, streak });
      } catch (e) {
        console.warn('Header mini stats notice:', e);
      }
    };

    loadMiniStats();
    window.addEventListener('prepsmart_refresh_interviews', loadMiniStats);
    return () => window.removeEventListener('prepsmart_refresh_interviews', loadMiniStats);
  }, [user]);

  const toggleTheme = () => {
    if (!mounted) return;
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  // Animate Header entry on mount
  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from(".nav-brand", { y: -20, opacity: 0, duration: 0.6 })
      .from(".nav-pill-item", { y: -15, opacity: 0, stagger: 0.06, duration: 0.5 }, "-=0.3")
      .from(".nav-action", { scale: 0.85, opacity: 0, duration: 0.5 }, "-=0.2");
  }, { scope: headerRef });

  // Scroll detection to adjust glassmorphism intensity
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [path]);

  // GSAP Magnetic Button Effect
  const handleMagneticMove = (e) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.3;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.3;
    gsap.to(el, { x, y, duration: 0.2, ease: "power2.out" });
  };

  const handleMagneticLeave = (e) => {
    gsap.to(e.currentTarget, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1.1, 0.35)" });
  };

  // Brand Logo & Name Hover Interactions
  const handleBrandEnter = (e) => {
    const brand = e.currentTarget;
    const logoImg = brand.querySelector('.brand-logo-img');
    const logoAura = brand.querySelector('.brand-logo-aura');
    const brandBadge = brand.querySelector('.brand-badge');
    const prepText = brand.querySelector('.brand-prep-text');

    if (logoImg) {
      gsap.to(logoImg, { scale: 1.12, rotate: -6, duration: 0.3, ease: "back.out(2)" });
    }
    if (logoAura) {
      gsap.to(logoAura, { opacity: 1, scale: 1.35, duration: 0.3 });
    }
    if (prepText) {
      gsap.to(prepText, { scale: 1.06, duration: 0.25, ease: "power2.out" });
    }
    if (brandBadge) {
      gsap.to(brandBadge, { y: -2, scale: 1.08, rotate: 3, duration: 0.25, ease: "back.out(2)" });
    }
  };

  const handleBrandLeave = (e) => {
    const brand = e.currentTarget;
    const logoImg = brand.querySelector('.brand-logo-img');
    const logoAura = brand.querySelector('.brand-logo-aura');
    const brandBadge = brand.querySelector('.brand-badge');
    const prepText = brand.querySelector('.brand-prep-text');

    if (logoImg) {
      gsap.to(logoImg, { scale: 1, rotate: 0, duration: 0.5, ease: "elastic.out(1.1, 0.4)" });
    }
    if (logoAura) {
      gsap.to(logoAura, { opacity: 0.5, scale: 1, duration: 0.4 });
    }
    if (prepText) {
      gsap.to(prepText, { scale: 1, duration: 0.3 });
    }
    if (brandBadge) {
      gsap.to(brandBadge, { y: 0, scale: 1, rotate: 0, duration: 0.35, ease: "power2.out" });
    }
  };

  // Nav Title & Icon Hover Interactions
  const handleNavItemEnter = (e) => {
    const link = e.currentTarget;
    const icon = link.querySelector('.nav-icon');
    const text = link.querySelector('.nav-text');
    const badge = link.querySelector('.nav-badge');
    const indicator = link.querySelector('.nav-indicator');

    if (icon) {
      gsap.to(icon, { y: -3, scale: 1.25, rotate: -8, duration: 0.25, ease: "back.out(2.5)" });
    }
    if (text) {
      gsap.to(text, { y: -1, duration: 0.2, ease: "power2.out" });
    }
    if (badge) {
      gsap.to(badge, { scale: 1.15, rotate: 6, duration: 0.25, ease: "back.out(2)" });
    }
    if (indicator) {
      gsap.to(indicator, { scale: 1, opacity: 1, duration: 0.22, ease: "back.out(2)" });
    }
  };

  const handleNavItemLeave = (e) => {
    const link = e.currentTarget;
    const icon = link.querySelector('.nav-icon');
    const text = link.querySelector('.nav-text');
    const badge = link.querySelector('.nav-badge');
    const indicator = link.querySelector('.nav-indicator');

    if (icon) {
      gsap.to(icon, { y: 0, scale: 1, rotate: 0, duration: 0.4, ease: "power2.out" });
    }
    if (text) {
      gsap.to(text, { y: 0, duration: 0.3 });
    }
    if (badge) {
      gsap.to(badge, { scale: 1, rotate: 0, duration: 0.35, ease: "power2.out" });
    }
    if (indicator) {
      gsap.to(indicator, { scale: 0, opacity: 0, duration: 0.2, ease: "power2.in" });
    }
  };

  const userInitial = user?.fullName?.[0] || user?.email?.[0]?.toUpperCase() || 'U';

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Questions', href: '/dashboard/questions', icon: Layers },
    { name: 'Upgrade', href: '/dashboard/upgrade', icon: Sparkles, badge: 'PRO' },
    { name: 'How it Works', href: '/#how-it-works', icon: PlayCircle }
  ];

  return (
    <header 
      ref={headerRef} 
      className={`sticky top-0 z-50 w-full px-3 sm:px-6 transition-all duration-300 ${
        isScrolled ? 'pt-2 pb-2' : 'pt-3 pb-3'
      }`}
    >
      <div 
        className={`max-w-7xl mx-auto rounded-2xl md:rounded-full backdrop-blur-2xl transition-all duration-300 border px-4 sm:px-6 py-2.5 flex items-center justify-between ${
          isScrolled 
            ? 'bg-white/95 dark:bg-[#0F172A]/95 border-slate-200/90 dark:border-slate-800 shadow-xl shadow-blue-500/5' 
            : 'bg-white/85 dark:bg-[#0F172A]/85 border-slate-200/70 dark:border-slate-800/80 shadow-lg shadow-slate-900/5'
        }`}
      >
        {/* =================================================================== */}
        {/* BRAND LOGO & SYSTEM STATUS                                         */}
        {/* =================================================================== */}
        <Link 
          href="/" 
          onMouseEnter={handleBrandEnter}
          onMouseLeave={handleBrandLeave}
          className="nav-brand flex items-center gap-3 group cursor-pointer shrink-0"
        >
          <div className="relative">
            {/* Luminous aura behind logo */}
            <div className="brand-logo-aura absolute inset-0 rounded-2xl bg-gradient-to-tr from-orange-500/35 via-rose-500/25 to-purple-600/40 blur-md opacity-50 transition-all pointer-events-none" />
            
            <div className="brand-logo-img relative p-1 rounded-2xl bg-slate-900/5 dark:bg-white/5 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-all duration-300">
              <Image 
                src="/logo.svg" 
                width={38} 
                height={38} 
                alt="PrepSmart AI Logo" 
                priority 
                className="rounded-xl drop-shadow-sm"
              />
            </div>
            {/* Pulsing online status indicator */}
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="flex items-center text-xl tracking-tight">
                <span className="brand-prep-text bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 bg-clip-text text-transparent font-black">
                  Prep
                </span>
                <span className="text-slate-900 dark:text-white font-extrabold ml-0.5">
                  Smart
                </span>
              </span>
              <Badge 
                variant="gradient" 
                className="brand-badge text-[10px] font-black uppercase px-2 py-0.5 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20 border-none"
              >
                AI 2.0
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400 dark:text-slate-500 hidden sm:flex tracking-wide -mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span>Adaptive Interview Intelligence</span>
            </div>
          </div>
        </Link>

        {/* =================================================================== */}
        {/* CENTER NAVIGATION PILL (Desktop)                                  */}
        {/* =================================================================== */}
        <nav className="hidden lg:flex items-center">
          <ul className="flex items-center gap-1 bg-slate-100/90 dark:bg-slate-800/80 p-1.5 rounded-full border border-slate-200/60 dark:border-slate-700/60 shadow-inner">
            {navLinks.map((item) => {
              const isActive = path === item.href;
              const Icon = item.icon;
              return (
                <li key={item.name} className="nav-pill-item">
                  <Link 
                    href={item.href}
                    onMouseEnter={handleNavItemEnter}
                    onMouseLeave={handleNavItemLeave}
                    className={`relative px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-2 group ${
                      isActive
                        ? 'text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md shadow-blue-500/30 font-bold'
                        : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/90 dark:hover:bg-slate-700/80'
                    }`}
                  >
                    <Icon className={`nav-icon w-3.5 h-3.5 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`} />
                    <span className="nav-text transition-colors">{item.name}</span>
                    {item.badge && (
                      <Badge 
                        variant={isActive ? "outline" : "success"}
                        className={`nav-badge text-[9px] font-black uppercase tracking-wider px-1.5 py-0 ${
                          isActive 
                            ? 'bg-white text-blue-600 border-none' 
                            : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm'
                        }`}
                      >
                        {item.badge}
                      </Badge>
                    )}
                    {/* Animated bottom indicator bar */}
                    <span className={`nav-indicator absolute -bottom-0.5 left-4 right-4 h-0.5 rounded-full bg-gradient-to-r from-blue-400 via-indigo-300 to-white/90 shadow-sm transition-all duration-300 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`} />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* =================================================================== */}
        {/* RIGHT ACTION BUTTONS & USER PROFILE                                 */}
        {/* =================================================================== */}
        <div className="nav-action flex items-center gap-2 sm:gap-2.5" ref={dropdownRef}>
          {/* Live Ollama AI Engine Telemetry Pill */}
          <div 
            title={ollamaStatus.online ? "Local Ollama daemon running on port 11434 (llama3.3)" : "Ollama local AI ready (Fallback active)"}
            className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200/80 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/70 text-[11px] font-bold text-slate-700 dark:text-slate-300 shadow-sm"
          >
            <span className={`w-2 h-2 rounded-full ${ollamaStatus.online ? 'bg-emerald-500 animate-pulse' : 'bg-blue-400'}`} />
            <span className="font-mono">Ollama {(ollamaStatus.model || 'llama3.3').toUpperCase()}</span>
            <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded-md ${ollamaStatus.online ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>
              {ollamaStatus.online ? 'Online' : 'Ready'}
            </span>
          </div>

          {/* Dark / Light Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle dark/light theme"
            title={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} mode`}
            className="w-8 h-8 rounded-full flex items-center justify-center border border-slate-200/80 dark:border-slate-700/80 bg-white/90 dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors shadow-sm cursor-pointer group shrink-0"
          >
            {mounted && resolvedTheme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700 dark:text-slate-200 group-hover:-rotate-12 transition-transform duration-300" />
            )}
          </button>

          {user ? (
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* Quick "+ New Mock" shortcut with glowing gradient */}
              <button 
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('prepsmart_open_new_mock'))}
                onMouseMove={handleMagneticMove}
                onMouseLeave={handleMagneticLeave}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer group"
              >
                <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-300" />
                <span>New Mock</span>
              </button>

              {/* User Avatar & Dropdown Trigger */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-slate-200/80 dark:border-slate-700/80 shadow-sm bg-white dark:bg-slate-900 group"
                  aria-label="User profile menu"
                >
                  <Avatar className="w-8 h-8 group-hover:scale-105 transition-transform">
                    <AvatarImage 
                      src={user.imageUrl || (typeof window !== 'undefined' ? localStorage.getItem('prepsmart_user_avatar') : null)} 
                      alt={user.fullName || "User"} 
                    />
                    <AvatarFallback>{userInitial}</AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[110px] truncate">
                    {user.fullName || user.email}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu Modal */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2.5 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800/80 mb-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {user.fullName || 'Candidate'}
                        </span>
                        {isDemoUser ? (
                          <Badge variant="warning" className="text-[9px] font-black uppercase px-1.5 py-0 bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                            Demo Mode
                          </Badge>
                        ) : (
                          <Badge variant="success" className="text-[9px] font-black uppercase px-1.5 py-0">
                            Active
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        {user.email}
                      </p>
                    </div>

                    {/* Candidate Performance Summary Strip */}
                    <div className="grid grid-cols-2 gap-1.5 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800/80 mb-2 text-[11px]">
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-white dark:bg-slate-900/80 rounded-xl border border-slate-200/60 dark:border-slate-800">
                        <span className="text-amber-500 font-bold">★</span>
                        <span className="text-slate-500 dark:text-slate-400">Score:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{candidateMiniStats.score}/10</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-white dark:bg-slate-900/80 rounded-xl border border-slate-200/60 dark:border-slate-800">
                        <span className="text-emerald-500 font-bold">⚡</span>
                        <span className="text-slate-500 dark:text-slate-400">Streak:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{candidateMiniStats.streak}d</span>
                      </div>
                    </div>

                    <div className="py-1 space-y-0.5">
                      <Link
                        href="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition"
                      >
                        <LayoutDashboard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>Candidate Dashboard</span>
                      </Link>
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          window.dispatchEvent(new CustomEvent('prepsmart_open_onboarding'));
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition text-left cursor-pointer"
                      >
                        <Sliders className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span>Calibrate Persona</span>
                      </button>
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          setSettingsOpen(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition text-left cursor-pointer"
                      >
                        <Settings className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                        <span>Account & Security Settings</span>
                      </button>
                      <Link
                        href="/dashboard/upgrade"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition"
                      >
                        <Crown className="w-4 h-4 text-amber-500" />
                        <span>Upgrade Plan</span>
                      </Link>
                    </div>

                    <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 mt-1">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          signOut();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/sign-in"
                onMouseMove={handleMagneticMove}
                onMouseLeave={handleMagneticLeave}
                className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-orange-600 dark:text-slate-200 dark:hover:text-orange-400 transition-colors rounded-full hover:bg-orange-500/10 cursor-pointer"
              >
                Sign In
              </Link>
              <Link href="/sign-up">
                <Button 
                  size="sm" 
                  onMouseMove={handleMagneticMove}
                  onMouseLeave={handleMagneticLeave}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-full shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Hamburger Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* MOBILE DRAWER MENU                                                  */}
      {/* =================================================================== */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          <ul className="space-y-1 pb-3 border-b border-slate-100 dark:border-slate-800">
            {navLinks.map((item) => {
              const isActive = path === item.href;
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-white text-blue-600' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="pt-3 space-y-3">
            {/* Mobile AI Telemetry & Theme Switcher Bar */}
            <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    ollamaStatus.connected ? 'bg-emerald-400' : 'bg-amber-400'
                  }`} />
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${
                    ollamaStatus.connected ? 'bg-emerald-500' : 'bg-amber-500'
                  }`} />
                </span>
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Ollama AI: {ollamaStatus.model ? ollamaStatus.model.toUpperCase() : 'LLAMA 3.3'}
                </span>
              </div>

              {/* Theme Toggle Button */}
              {mounted && (
                <button
                  type="button"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 shadow-sm"
                  aria-label="Toggle color theme"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      <span>Light</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-3.5 h-3.5 text-blue-400" />
                      <span>Dark</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {user ? (
              <>
                {/* Mobile Candidate Mini-Metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <span className="text-amber-500 text-sm font-bold">★</span>
                    <div>
                      <p className="text-[10px] text-slate-400 font-medium">Avg Score</p>
                      <p className="font-bold text-slate-800 dark:text-slate-100">{candidateMiniStats.score} / 10</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <span className="text-emerald-500 text-sm font-bold">⚡</span>
                    <div>
                      <p className="text-[10px] text-slate-400 font-medium">Daily Streak</p>
                      <p className="font-bold text-slate-800 dark:text-slate-100">{candidateMiniStats.streak} Days</p>
                    </div>
                  </div>
                </div>

                {/* Mobile Quick Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      window.dispatchEvent(new CustomEvent('prepsmart_open_new_mock'));
                    }}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs rounded-2xl shadow-md cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Mock</span>
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      window.dispatchEvent(new CustomEvent('prepsmart_open_onboarding'));
                    }}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-bold text-xs rounded-2xl border border-purple-200/60 dark:border-purple-800/50 cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Persona</span>
                  </button>
                </div>

                <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                      {userInitial}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {user.fullName || user.email}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut();
                    }}
                    className="text-xs text-red-600 hover:bg-red-50 hover:text-red-700 font-bold"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full text-xs font-bold rounded-xl">
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* In-App Account & Security Settings Dialog */}
      <AccountSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </header>
  );
}

export default Header;