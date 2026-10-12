"use client"
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useRef, useState, useEffect } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useAuth } from '@/context/AuthContext'
import { LogOut, User, Sparkles, ChevronDown, LayoutDashboard } from 'lucide-react'

function Header() {
    const path = usePathname();
    const headerRef = useRef(null);
    const { user, signOut, loading } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useGSAP(() => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.from(".nav-logo", { y: -25, opacity: 0, duration: 0.7 })
          .from(".nav-item", { y: -20, opacity: 0, stagger: 0.08, duration: 0.5 }, "-=0.4")
          .from(".nav-user", { scale: 0.8, opacity: 0, duration: 0.5 }, "-=0.3");
    }, { scope: headerRef });

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

    const userInitial = user?.fullName?.[0] || user?.email?.[0]?.toUpperCase() || 'U';

    return (
        <header ref={headerRef} className='sticky top-0 z-50 backdrop-blur-md bg-[#F8FAFC]/90 dark:bg-[#0F172A]/90 border-b border-slate-200/80 dark:border-slate-800/80 transition-all'>
            <div className='flex p-3.5 px-6 md:px-10 items-center justify-between max-w-7xl mx-auto'>
                {/* Brand Logo & Title */}
                <Link href="/" className='nav-logo flex items-center gap-3 group cursor-pointer'>
                    <div className='p-0.5 rounded-2xl bg-gradient-to-tr from-blue-600/20 via-emerald-500/20 to-blue-500/20 group-hover:scale-105 transition-all duration-300 shadow-sm'>
                        <Image 
                            src={'/logo.svg'} 
                            width={38} 
                            height={38} 
                            alt='PrepSmart AI Logo' 
                            priority 
                            className='rounded-xl shadow-inner'
                        />
                    </div>
                    <span className='font-extrabold text-xl tracking-tight text-[#0F172A] dark:text-white flex items-center gap-2'>
                        PrepSmart
                        <span className='text-[10px] font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] px-2 py-0.5 rounded-full shadow-sm'>
                            AI 2.0
                        </span>
                    </span>
                </Link>

                {/* Navigation Links with animated indicators */}
                <nav>
                    <ul className='hidden md:flex items-center gap-1 bg-slate-100/90 dark:bg-slate-800/70 p-1.5 rounded-full border border-slate-200/60 dark:border-slate-700/60 shadow-inner'>
                        {[
                            { name: 'Dashboard', href: '/dashboard' },
                            { name: 'Questions', href: '/dashboard/questions' },
                            { name: 'Upgrade', href: '/dashboard/upgrade' },
                            { name: 'How it Works', href: '/#how-it-works' }
                        ].map((item) => {
                            const isActive = path === item.href;
                            return (
                                <li key={item.name} className='nav-item'>
                                    <Link 
                                        href={item.href}
                                        className={`relative px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 block ${
                                            isActive
                                                ? 'text-white bg-[#2563EB] shadow-sm'
                                                : 'text-slate-600 dark:text-slate-300 hover:text-[#2563EB] hover:bg-white/70 dark:hover:bg-slate-700/60'
                                        }`}
                                    >
                                        {item.name}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* User Profile & Action with Supabase Auth */}
                <div className='nav-user flex items-center gap-3' ref={dropdownRef}>
                    {user ? (
                        <div className="relative">
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-slate-200/60 dark:border-slate-700/60"
                                aria-label="User profile menu"
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                                    {userInitial}
                                </div>
                                <span className="hidden sm:inline text-xs font-semibold text-slate-700 dark:text-slate-200 max-w-[120px] truncate">
                                    {user.fullName || user.email}
                                </span>
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                            </button>

                            {/* Dropdown Menu */}
                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                                    <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                                            {user.fullName || 'Candidate'}
                                        </p>
                                        <p className="text-xs text-slate-500 truncate mt-0.5">
                                            {user.email}
                                        </p>
                                    </div>

                                    <div className="py-1">
                                        <Link
                                            href="/dashboard"
                                            onClick={() => setDropdownOpen(false)}
                                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition"
                                        >
                                            <LayoutDashboard className="w-4 h-4 text-blue-600" />
                                            Dashboard
                                        </Link>
                                        <Link
                                            href="/dashboard/upgrade"
                                            onClick={() => setDropdownOpen(false)}
                                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition"
                                        >
                                            <Sparkles className="w-4 h-4 text-emerald-500" />
                                            Upgrade Plan
                                        </Link>
                                    </div>

                                    <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                                        <button
                                            onClick={() => {
                                                setDropdownOpen(false);
                                                signOut();
                                            }}
                                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link
                                href="/sign-in"
                                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 dark:text-slate-200 transition"
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/sign-up"
                                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-full shadow-sm transition"
                            >
                                Get Started
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}

export default Header