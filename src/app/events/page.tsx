import { getEvents, getDistinctCategories, getDistinctTags, getAllUsersBasic } from '@/lib/queries';
import EventFilterBar from '@/components/EventFilterBar';
import CreateEventModal from '@/components/CreateEventModal';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function EventsPage({ searchParams }: any) {
    const resolvedParams = await searchParams || {};

    const [events, categories, tags, organizers] = await Promise.all([
        getEvents(resolvedParams),
        getDistinctCategories(),
        getDistinctTags(),
        getAllUsersBasic(),
    ]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Page header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text)', margin: 0 }}>Events</h1>
                    <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>Browse and manage campus events</p>
                </div>
                <CreateEventModal organizers={organizers} />
            </div>

            {/* Filter bar */}
            <div className="aws-panel" style={{ padding: '12px 16px' }}>
                <EventFilterBar categories={categories} tags={tags} />
            </div>

            {/* Events table */}
            <div className="aws-panel">
                <div className="aws-panel-header">
                    <h2 className="aws-panel-title" style={{ fontSize: '14px' }}>
                        Events <span style={{ fontWeight: '400', color: 'var(--muted)', fontSize: '13px' }}>({events.length})</span>
                    </h2>
                </div>
                <table className="aws-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Category</th>
                            <th>Start Date</th>
                            <th>Location</th>
                            <th>Tags</th>
                            <th>Seats</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
                                    No events match the current filters.
                                </td>
                            </tr>
                        ) : (
                            events.map((event: any) => {
                                const confirmed = event.registrations?.filter((r: any) => r.status === 'confirmed').length || 0;
                                const isFull = confirmed >= event.capacity;
                                const isPast = new Date(event.startDate) < new Date();
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
                                        <td style={{ color: 'var(--muted)' }}>
                                            {event.location?.building}, {event.location?.room}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                                {event.tags?.slice(0, 3).map((tag: string) => (
                                                    <span key={tag} className="badge-tag">{tag}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td style={{ whiteSpace: 'nowrap' }}>
                                            <span style={{ fontWeight: '600' }}>{confirmed}</span>
                                            <span style={{ color: 'var(--muted)' }}>/{event.capacity}</span>
                                            <div className="aws-progress-track" style={{ width: '64px', marginTop: '4px' }}>
                                                <div className="aws-progress-fill" style={{
                                                    width: `${pct}%`,
                                                    background: isFull ? 'var(--error)' : pct >= 80 ? '#693105' : 'var(--primary)'
                                                }} />
                                            </div>
                                        </td>
                                        <td>
                                            {isFull ? (
                                                <span className="badge-full">Full</span>
                                            ) : isPast ? (
                                                <span className="badge-past">Ended</span>
                                            ) : (
                                                <span className="badge-upcoming">Open</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
