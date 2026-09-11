'use client';

import './globals.css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CalendarDays, Users, BarChart3, ChevronRight } from 'lucide-react';

const NAV_ITEMS = [
    { href: '/',          icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/events',    icon: CalendarDays,    label: 'Events' },
    { href: '/users',     icon: Users,            label: 'Users' },
    { href: '/analytics', icon: BarChart3,        label: 'Analytics' },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <html lang="en">
            <head>
                <title>Campus Event Manager</title>
                <meta name="description" content="Manage campus events, users, and registrations" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
            </head>
            <body className="flex h-screen bg-background font-sans overflow-hidden text-foreground">

                {/* Sidebar */}
                <aside className="w-64 bg-nav-bg border-r border-nav-border flex flex-col shrink-0">

                    {/* Logo */}
                    <div className="px-6 h-16 flex items-center border-b border-nav-border">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-800 leading-tight tracking-tight">Campus Events</p>
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">Manager</p>
                            </div>
                        </div>
                    </div>

                    {/* Nav */}
                    <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 pb-2 pt-2">
                            Menu
                        </p>
                        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
                            const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                        isActive 
                                            ? 'bg-primary-50 text-primary-700 shadow-sm' 
                                            : 'text-nav-text hover:bg-nav-hover hover:text-slate-900'
                                    }`}
                                >
                                    <Icon size={18} className={`${isActive ? 'text-primary-600' : 'text-slate-400'}`} />
                                    <span className="flex-1">{label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-nav-border">
                        <p className="text-xs text-slate-400 font-medium">aivancity · Campus Manager</p>
                    </div>
                </aside>

                {/* Main area */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">

                    {/* Top bar */}
                    <header className="h-16 bg-surface/80 backdrop-blur-md border-b border-border flex items-center px-8 shrink-0 z-10 sticky top-0">
                        <PageBreadcrumb pathname={pathname} />
                    </header>

                    {/* Content */}
                    <main className="flex-1 overflow-y-auto p-8">
                        <div className="max-w-7xl mx-auto w-full">
                            {children}
                        </div>
                    </main>
                </div>
            </body>
        </html>
    );
}

function PageBreadcrumb({ pathname }: { pathname: string }) {
    const segments: { label: string; href: string }[] = [{ label: 'Campus Event Manager', href: '/' }];
    if (pathname.startsWith('/events/') && pathname.length > 8) {
        segments.push({ label: 'Events', href: '/events' });
        segments.push({ label: 'Event Detail', href: pathname });
    } else if (pathname === '/events') {
        segments.push({ label: 'Events', href: '/events' });
    } else if (pathname.startsWith('/users/') && pathname.length > 7) {
        segments.push({ label: 'Users', href: '/users' });
        segments.push({ label: 'User Detail', href: pathname });
    } else if (pathname === '/users') {
        segments.push({ label: 'Users', href: '/users' });
    } else if (pathname === '/analytics') {
        segments.push({ label: 'Analytics', href: '/analytics' });
    }

    return (
        <div className="flex items-center gap-2 text-sm">
            {segments.map((seg, idx) => (
                <span key={seg.href} className="flex items-center gap-2">
                    {idx > 0 && <ChevronRight size={14} className="text-slate-400" />}
                    {idx === segments.length - 1 ? (
                        <span className="text-slate-900 font-semibold">{seg.label}</span>
                    ) : (
                        <Link href={seg.href} className="text-slate-500 hover:text-primary-600 transition-colors font-medium">
                            {seg.label}
                        </Link>
                    )}
                </span>
            ))}
        </div>
    );
}
