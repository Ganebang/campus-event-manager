import { getEventById, getAllUsersBasic } from '@/lib/queries';
import { updateEvent, deleteEvent } from '@/actions/eventActions';
import { cancelRegistration } from '@/actions/registerActions';
import RegistrationManager from '@/components/RegistrationManager';
import { Trash2 } from 'lucide-react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import EditEventModal from '@/components/EditEventModal';

export const dynamic = 'force-dynamic';

export default async function EventDetailsPage({ params }: any) {
    const { id } = await params;
    const event = await getEventById(id);

    if (!event) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>
                <p>Event not found.</p>
                <Link href="/events" style={{ color: 'var(--primary)', textDecoration: 'none', marginTop: '8px', display: 'inline-block' }}>
                    ← Back to Events
                </Link>
            </div>
        );
    }

    const allUsers = await getAllUsersBasic();
    const confirmedCount = event.registrations?.filter((r: any) => r.status === 'confirmed').length || 0;
    const isFull = confirmedCount >= event.capacity;
    const occupancyPercent = event.capacity > 0 ? (confirmedCount / event.capacity) * 100 : 0;
    const isPast = new Date(event.startDate) < new Date();

    const registeredUserIds = event.registrations?.map((r: any) => r.userId.toString()) || [];
    const availableUsers = allUsers.filter((u: any) => !registeredUserIds.includes(u._id.toString()));

    const handleUpdate = async (fd: FormData) => {
        'use server';
        await updateEvent(id, fd);
    };

    const handleDelete = async () => {
        'use server';
        await deleteEvent(id);
        redirect('/events');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        {isPast
                            ? <span className="badge-past">Ended</span>
                            : <span className="badge-upcoming">Open</span>
                        }
                        {isFull && <span className="badge-full">At capacity</span>}
                        <span className="badge-category">{event.category}</span>
                    </div>
                    <h1 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text)', margin: 0 }}>{event.title}</h1>
                    <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>{event.description}</p>
                    {event.tags?.length > 0 && (
                        <div style={{ display: 'flex', gap: '5px', marginTop: '8px', flexWrap: 'wrap' }}>
                            {event.tags.map((tag: string) => (
                                <span key={tag} className="badge-tag">{tag}</span>
                            ))}
                        </div>
                    )}
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <EditEventModal event={event} allUsers={allUsers} handleUpdate={handleUpdate} />
                    <form action={handleDelete}>
                        <button type="submit" className="btn-danger">
                            <Trash2 size={13} /> Delete
                        </button>
                    </form>
                </div>
            </div>

            {/* Two-column layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'start' }}>

                {/* Left column: details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

                    {/* Details panel */}
                    <div className="panel">
                        <div className="section-header">
                            <span className="section-title">Event Details</span>
                        </div>
                        <div style={{ padding: '0' }}>
                            {[
                                { key: 'Start', value: new Date(event.startDate).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) },
                                { key: 'End', value: new Date(event.endDate).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) },
                                { key: 'Campus', value: event.location?.campus },
                                { key: 'Building', value: event.location?.building },
                                { key: 'Room', value: event.location?.room },
                            ].map(row => (
                                <div key={row.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '9px 14px', borderBottom: '1px solid var(--border-light)' }}>
                                    <span style={{ fontSize: '12px', color: 'var(--muted)', flexShrink: 0, marginRight: '12px' }}>{row.key}</span>
                                    <span style={{ fontSize: '13px', color: 'var(--text)', textAlign: 'right' }}>{row.value}</span>
                                </div>
                            ))}
                            <div style={{ padding: '9px 14px', borderBottom: '1px solid var(--border-light)' }}>
                                <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Organizer</span>
                                <p style={{ fontSize: '13px', color: 'var(--text)', marginTop: '2px', marginBottom: 0 }}>
                                    {event.organizerInfo ? `${event.organizerInfo.firstName} ${event.organizerInfo.lastName}` : '—'}
                                </p>
                                {event.organizerInfo?.email && (
                                    <p style={{ fontSize: '11px', color: 'var(--muted)', margin: 0 }}>{event.organizerInfo.email}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Capacity panel */}
                    <div className="panel">
                        <div className="section-header">
                            <span className="section-title">Capacity</span>
                        </div>
                        <div style={{ padding: '14px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                                <span style={{ color: 'var(--muted)' }}>Registered</span>
                                <span style={{ fontWeight: '700' }}>{confirmedCount} / {event.capacity}</span>
                            </div>
                            <div className="progress-track" style={{ height: '6px' }}>
                                <div className="progress-fill" style={{
                                    width: `${Math.min(occupancyPercent, 100)}%`,
                                    background: isFull ? 'var(--error)' : occupancyPercent >= 80 ? 'var(--warning)' : 'var(--primary)'
                                }} />
                            </div>
                            <p style={{ fontSize: '12px', color: isFull ? 'var(--error)' : 'var(--muted)', marginTop: '6px', textAlign: 'right' }}>
                                {occupancyPercent.toFixed(1)}% occupied
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right column: registrations */}
                <div className="panel">
                    <div className="panel-header">
                        <h2 className="panel-title" style={{ fontSize: '14px' }}>
                            Registrations <span style={{ fontWeight: '400', color: 'var(--muted)', fontSize: '13px' }}>({event.registrations?.length || 0})</span>
                        </h2>
                        {isFull && <span className="badge-full">At capacity</span>}
                    </div>

                    {/* Register widget */}
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-light)', background: '#f8f9fa' }}>
                        <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--label)', marginBottom: '8px' }}>ADD PARTICIPANT</p>
                        <RegistrationManager eventId={id} availableUsers={availableUsers} isFull={isFull} />
                    </div>

                    {/* Participants table */}
                    {event.registrations?.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
                            No registrations yet.
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Participant</th>
                                    <th>Email</th>
                                    <th>Registered on</th>
                                    <th>Status</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {event.registrations?.map((reg: any, idx: number) => {
                                    const user = event.registeredUsersData?.find((u: any) => u._id.toString() === reg.userId.toString());
                                    if (!user) return null;
                                    return (
                                        <tr key={idx}>
                                            <td>
                                                <Link href={`/users/${user._id}`} className="link">
                                                    {user.firstName} {user.lastName}
                                                </Link>
                                            </td>
                                            <td style={{ color: 'var(--muted)' }}>{user.email}</td>
                                            <td style={{ color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                                                {new Date(reg.registeredAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td>
                                                {reg.status === 'confirmed'
                                                    ? <span className="badge-confirmed">Confirmed</span>
                                                    : <span className="badge-cancelled">Cancelled</span>
                                                }
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <form action={async () => {
                                                    'use server';
                                                    await cancelRegistration(id, user._id.toString());
                                                }}>
                                                    <button type="submit" className="btn-danger" style={{ padding: '3px 10px', fontSize: '12px' }}>
                                                        Remove
                                                    </button>
                                                </form>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
