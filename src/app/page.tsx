import { getDashboardStats, getNextUpcomingEvents, getMostPopularEvent, getCategoryBreakdown } from '@/lib/queries';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
    const [stats, upcomingEvents, mostPopularEvent, categoryBreakdown] = await Promise.all([
        getDashboardStats(),
        getNextUpcomingEvents(8),
        getMostPopularEvent(),
        getCategoryBreakdown(),
    ]);

    const popularConfirmedCount = mostPopularEvent
        ? (mostPopularEvent.registrations?.filter((r: any) => r.status === 'confirmed').length || 0)
        : 0;
    const popularOccupancy = mostPopularEvent && mostPopularEvent.capacity > 0
        ? Math.round((popularConfirmedCount / mostPopularEvent.capacity) * 100)
        : 0;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Page title */}
            <div>
                <h1 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text)', margin: 0 }}>Dashboard</h1>
                <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>Overview of campus event activity</p>
            </div>

            {/* KPI Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                {[
                    { label: 'Total Users',     value: stats.totalUsers,         href: '/users' },
                    { label: 'Total Events',    value: stats.totalEvents,        href: '/events' },
                    { label: 'Upcoming Events', value: stats.upcomingEvents,     href: '/events?timeframe=upcoming' },
                    { label: 'Registrations',   value: stats.totalRegistrations, href: '/analytics' },
                ].map(kpi => (
                    <Link key={kpi.label} href={kpi.href} style={{ textDecoration: 'none' }}>
                        <div className="aws-stat">
                            <div className="aws-stat-label">{kpi.label}</div>
                            <div className="aws-stat-value">{kpi.value}</div>
                        </div>
                    </Link>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '16px' }}>

                {/* Upcoming events table */}
                <div className="aws-panel">
                    <div className="aws-panel-header">
                        <h2 className="aws-panel-title">Upcoming Events</h2>
                        <Link href="/events?timeframe=upcoming" className="btn-aws-secondary" style={{ fontSize: '12px', padding: '4px 10px' }}>
                            View all <ArrowRight size={12} />
                        </Link>
                    </div>
                    <table className="aws-table">
                        <thead>
                            <tr>
                                <th>Event</th>
                                <th>Category</th>
                                <th>Date</th>
                                <th>Location</th>
                                <th>Seats</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {upcomingEvents.length === 0 ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--muted)', padding: '24px' }}>No upcoming events</td></tr>
                            ) : (
                                upcomingEvents.map((event: any) => {
                                    const confirmed = event.registrations?.filter((r: any) => r.status === 'confirmed').length || 0;
                                    const isFull = confirmed >= event.capacity;
                                    const pct = event.capacity > 0 ? Math.round(confirmed / event.capacity * 100) : 0;
                                    return (
                                        <tr key={event._id}>
                                            <td>
                                                <Link href={`/events/${event._id}`} className="aws-link">
                                                    {event.title}
                                                </Link>
                                            </td>
                                            <td><span className="badge-category">{event.category}</span></td>
                                            <td style={{ color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                                                {new Date(event.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td style={{ color: 'var(--muted)' }}>{event.location?.building}</td>
                                            <td style={{ whiteSpace: 'nowrap' }}>
                                                <span>{confirmed}/{event.capacity}</span>
                                                <div className="aws-progress-track" style={{ width: '60px', marginTop: '4px' }}>
                                                    <div className="aws-progress-fill" style={{ width: `${pct}%`, background: isFull ? 'var(--error)' : pct >= 80 ? 'var(--warning)' : 'var(--primary)' }} />
                                                </div>
                                            </td>
                                            <td>{isFull ? <span className="badge-full">Full</span> : <span className="badge-upcoming">Open</span>}</td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Right column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                    {/* Most popular event */}
                    {mostPopularEvent && (
                        <div className="aws-panel">
                            <div className="aws-section-header">
                                <span className="aws-section-title">Most Popular Event</span>
                            </div>
                            <div className="aws-panel-body">
                                <Link href={`/events/${mostPopularEvent._id}`} className="aws-link">
                                    {mostPopularEvent.title}
                                </Link>
                                <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px', marginBottom: '12px' }}>
                                    {mostPopularEvent.category} · {mostPopularEvent.location?.campus}
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                                    <span style={{ color: 'var(--muted)' }}>Occupancy</span>
                                    <span style={{ fontWeight: '700' }}>{popularConfirmedCount} / {mostPopularEvent.capacity} seats ({popularOccupancy}%)</span>
                                </div>
                                <div className="aws-progress-track">
                                    <div className="aws-progress-fill" style={{ width: `${popularOccupancy}%`, background: 'var(--primary)' }} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Category breakdown */}
                    <div className="aws-panel" style={{ flex: 1 }}>
                        <div className="aws-section-header">
                            <span className="aws-section-title">Events by Category</span>
                            <Link href="/analytics" className="aws-link" style={{ fontSize: '12px', fontWeight: '400' }}>Details</Link>
                        </div>
                        <div className="aws-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {categoryBreakdown.map((cat: any) => {
                                const max = Math.max(...categoryBreakdown.map((c: any) => c.count), 1);
                                const pct = Math.round((cat.count / max) * 100);
                                return (
                                    <div key={cat._id}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                                            <span style={{ color: 'var(--text)' }}>{cat._id}</span>
                                            <span style={{ color: 'var(--muted)', fontWeight: '600' }}>{cat.count}</span>
                                        </div>
                                        <div className="aws-progress-track">
                                            <div className="aws-progress-fill" style={{ width: `${pct}%`, background: 'var(--primary)' }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
