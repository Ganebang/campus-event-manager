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
            <body className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)', fontFamily: 'Inter, sans-serif' }}>

                {/* Sidebar */}
                <aside style={{ width: '220px', background: 'var(--nav)', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>

                    {/* Logo */}
                    <div style={{ padding: '0 16px', height: '56px', display: 'flex', alignItems: 'center', borderBottom: '1px solid #2d3b4e' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '28px', height: '28px', background: 'var(--accent)', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <div>
                                <p style={{ fontSize: '13px', fontWeight: '700', color: '#fff', lineHeight: '1.2' }}>Campus Events</p>
                                <p style={{ fontSize: '10px', color: 'var(--nav-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Management</p>
                            </div>
                        </div>
                    </div>

                    {/* Nav */}
                    <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
                        <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--nav-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', padding: '10px 16px 6px' }}>
                            Menu
                        </p>
                        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
                            const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '10px',
                                        padding: '8px 16px',
                                        fontSize: '13px',
                                        fontWeight: isActive ? '600' : '400',
                                        color: isActive ? '#fff' : 'var(--nav-text)',
                                        background: isActive ? 'rgba(236,114,17,0.15)' : 'transparent',
                                        borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
                                        textDecoration: 'none',
                                        transition: 'background 0.1s',
                                    }}
                                    onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--nav-hover)'; }}
                                    onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                                >
                                    <Icon size={15} style={{ color: isActive ? 'var(--accent)' : 'var(--nav-muted)', flexShrink: 0 }} />
                                    <span style={{ flex: 1 }}>{label}</span>
                                    {isActive && <ChevronRight size={12} style={{ color: 'var(--nav-muted)' }} />}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div style={{ padding: '12px 16px', borderTop: '1px solid #2d3b4e' }}>
                        <p style={{ fontSize: '11px', color: 'var(--nav-muted)' }}>aivancity · Campus Manager</p>
                    </div>
                </aside>

                {/* Main area */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>

                    {/* Top bar */}
                    <header style={{ height: '56px', background: 'var(--nav)', borderBottom: '1px solid #2d3b4e', display: 'flex', alignItems: 'center', padding: '0 20px', flexShrink: 0 }}>
                        <PageBreadcrumb pathname={pathname} />
                    </header>

                    {/* Content */}
                    <main style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
                        {children}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
            {segments.map((seg, idx) => (
                <span key={seg.href} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {idx > 0 && <ChevronRight size={11} style={{ color: '#879596' }} />}
                    {idx === segments.length - 1 ? (
                        <span style={{ color: '#d5dbdb', fontWeight: idx > 0 ? '600' : '400' }}>{seg.label}</span>
                    ) : (
                        <Link href={seg.href} style={{ color: '#879596', textDecoration: 'none' }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#d5dbdb'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#879596'}
                        >{seg.label}</Link>
                    )}
                </span>
            ))}
        </div>
    );
}
