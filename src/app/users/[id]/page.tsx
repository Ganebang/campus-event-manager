import { getUserById } from '@/lib/queries';
import { updateUser, deleteUser } from '@/actions/userActions';
import { Trash2 } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import EditUserModal from '@/components/EditUserModal';

export const dynamic = 'force-dynamic';

export default async function UserDetailsPage({ params }: any) {
    const { id } = await params;
    const user = await getUserById(id);

    if (!user) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>
                <p>User not found.</p>
                <Link href="/users" style={{ color: 'var(--primary)', textDecoration: 'none', marginTop: '8px', display: 'inline-block' }}>
                    ← Back to Users
                </Link>
            </div>
        );
    }

    const upcomingRegistrations = user.registeredEvents?.filter((e: any) => new Date(e.startDate) >= new Date()) || [];
    const pastRegistrations     = user.registeredEvents?.filter((e: any) => new Date(e.startDate) < new Date()) || [];

    const handleUpdate = async (fd: FormData) => {
        'use server';
        await updateUser(id, fd);
    };

    const handleDelete = async () => {
        'use server';
        await deleteUser(id);
        redirect('/users');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                <div>
                    <div style={{ marginBottom: '4px' }}>
                        <span className="badge-role">{user.role}</span>
                    </div>
                    <h1 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text)', margin: 0 }}>
                        {user.firstName} {user.lastName}
                    </h1>
                    <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>{user.email}</p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <EditUserModal user={user} handleUpdate={handleUpdate} />
                    <form action={handleDelete}>
                        <button type="submit" className="btn-danger">
                            <Trash2 size={13} /> Delete
                        </button>
                    </form>
                </div>
            </div>

            {/* Two columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '16px', alignItems: 'start' }}>

                {/* Left: profile details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

                    <div className="panel">
                        <div className="section-header">
                            <span className="section-title">Profile</span>
                        </div>
                        <div>
                            {[
                                { key: 'First name',  value: user.firstName },
                                { key: 'Last name',   value: user.lastName },
                                { key: 'Email',       value: user.email },
                                { key: 'Department',  value: user.department },
                                { key: 'Role',        value: user.role },
                                { key: 'Interests',   value: user.interests?.join(', ') || '—' },
                                { key: 'Member since',value: new Date(user.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) },
                            ].map(row => (
                                <div key={row.key} style={{ padding: '9px 14px', borderBottom: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' }}>{row.key}</span>
                                    <span style={{ fontSize: '13px', color: 'var(--text)', wordBreak: 'break-word' }}>{row.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="panel">
                        <div className="section-header">
                            <span className="section-title">Activity</span>
                        </div>
                        <div>
                            {[
                                { label: 'Total events',    value: user.registeredEvents?.length || 0 },
                                { label: 'Upcoming',        value: upcomingRegistrations.length },
                                { label: 'Past',            value: pastRegistrations.length },
                            ].map(stat => (
                                <div key={stat.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 14px', borderBottom: '1px solid var(--border-light)' }}>
                                    <span style={{ fontSize: '13px', color: 'var(--muted)' }}>{stat.label}</span>
                                    <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text)' }}>{stat.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: event history table */}
                <div className="panel">
                    <div className="panel-header">
                        <h2 className="panel-title" style={{ fontSize: '14px' }}>
                            Event History <span style={{ fontWeight: '400', color: 'var(--muted)', fontSize: '13px' }}>({user.registeredEvents?.length || 0})</span>
                        </h2>
                    </div>
                    {!user.registeredEvents || user.registeredEvents.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
                            No event registrations yet.
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Event</th>
                                    <th>Category</th>
                                    <th>Date</th>
                                    <th>Location</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {user.registeredEvents.map((event: any, idx: number) => {
                                    const isUpcoming = new Date(event.startDate) >= new Date();
                                    const eventReg = event.registrations?.find((r: any) => r.userId?.toString() === id);
                                    return (
                                        <tr key={idx}>
                                            <td>
                                                <Link href={`/events/${event._id}`} className="link">
                                                    {event.title}
                                                </Link>
                                            </td>
                                            <td><span className="badge-category">{event.category}</span></td>
                                            <td style={{ color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                                                {new Date(event.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td style={{ color: 'var(--muted)' }}>{event.location?.building}</td>
                                            <td>
                                                {isUpcoming
                                                    ? <span className="badge-upcoming">Upcoming</span>
                                                    : <span className="badge-past">Ended</span>
                                                }
                                                {eventReg?.status === 'cancelled' && (
                                                    <span className="badge-cancelled" style={{ marginLeft: '4px' }}>Cancelled</span>
                                                )}
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
