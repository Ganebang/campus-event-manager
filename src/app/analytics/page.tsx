import {
    getRegistrationsByCategory,
    getTop5PopularEvents,
    getUsersWithNoRegistration,
    getEventsAboveAverageOccupancy,
    getMostUsedTags,
    getEventsByMonth
} from '@/lib/queries';

export const dynamic = 'force-dynamic';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default async function AnalyticsPage() {
    const [
        regsByCategory,
        topEvents,
        inactiveUsers,
        occupancyData,
        topTags,
        eventsByMonth
    ] = await Promise.all([
        getRegistrationsByCategory(),
        getTop5PopularEvents(),
        getUsersWithNoRegistration(),
        getEventsAboveAverageOccupancy(),
        getMostUsedTags(),
        getEventsByMonth()
    ]);

    const avgOccupancyPercent = occupancyData?.avgOccupancy ? occupancyData.avgOccupancy * 100 : 0;
    const maxCategoryRegs = Math.max(...regsByCategory.map((c: any) => c.totalRegistrations), 1);
    const maxMonthRegs = Math.max(...eventsByMonth.map((m: any) => m.totalRegistrations), 1);
    const maxTagCount = topTags[0]?.count || 1;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            <div>
                <h1 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text)', margin: 0 }}>Analytics</h1>
                <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>Campus event activity reports</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

                {/* A: Registrations by category — uses $group + $sum aggregation pipeline */}
                <div className="panel">
                    <div className="section-header">
                        <span className="section-title">Registrations by Category</span>
                    </div>
                    <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {regsByCategory.map((cat: any) => {
                            const barPct = Math.round((cat.totalRegistrations / maxCategoryRegs) * 100);
                            return (
                                <div key={cat._id}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}>
                                        <span style={{ color: 'var(--text)' }}>{cat._id}</span>
                                        <span style={{ color: 'var(--muted)' }}>{cat.totalRegistrations} registrations · {cat.eventCount} events</span>
                                    </div>
                                    <div className="progress-track" style={{ height: '5px' }}>
                                        <div className="progress-fill" style={{ width: `${barPct}%`, background: 'var(--primary)' }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* B: Top 5 most popular events — uses $sort + $limit + occupancy calculation */}
                <div className="panel">
                    <div className="section-header">
                        <span className="section-title">Top 5 Most Popular Events</span>
                    </div>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Event</th>
                                <th>Registrations</th>
                                <th>Occupancy</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topEvents.map((evt: any, idx: number) => (
                                <tr key={evt._id}>
                                    <td style={{ color: idx === 0 ? 'var(--accent)' : 'var(--muted)', fontWeight: idx === 0 ? '700' : '400', width: '30px' }}>
                                        {idx + 1}
                                    </td>
                                    <td style={{ fontSize: '13px', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{evt.title}</td>
                                    <td style={{ fontWeight: '700' }}>{evt.confirmedRegistrations}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div className="progress-track" style={{ width: '60px', height: '4px' }}>
                                                <div className="progress-fill" style={{
                                                    width: `${Math.min(evt.occupancyPercentage, 100)}%`,
                                                    background: evt.occupancyPercentage >= 100 ? 'var(--error)' : 'var(--primary)'
                                                }} />
                                            </div>
                                            <span style={{ fontSize: '12px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{evt.occupancyPercentage.toFixed(0)}%</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* C: Users with no registrations — uses $lookup + size filter */}
                <div className="panel">
                    <div className="section-header">
                        <span className="section-title">Users With No Registration ({inactiveUsers.length})</span>
                    </div>
                    {inactiveUsers.length === 0 ? (
                        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
                            All users have at least one registration.
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Department</th>
                                    <th>Role</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inactiveUsers.map((u: any) => (
                                    <tr key={u._id}>
                                        <td style={{ fontWeight: '600' }}>{u.firstName} {u.lastName}</td>
                                        <td style={{ color: 'var(--muted)' }}>{u.email}</td>
                                        <td style={{ color: 'var(--muted)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.department}</td>
                                        <td><span className="badge-role">{u.role}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* D: Events above average occupancy — uses $facet + $avg + $filter */}
                <div className="panel">
                    <div className="section-header">
                        <span className="section-title">Events Above Average Occupancy</span>
                    </div>
                    <div style={{ padding: '8px 16px 4px', borderBottom: '1px solid var(--border-light)' }}>
                        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                            Global average: <strong style={{ color: 'var(--text)' }}>{avgOccupancyPercent.toFixed(1)}%</strong>
                        </span>
                    </div>
                    {occupancyData?.events?.length === 0 ? (
                        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>No events above average.</div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Event</th>
                                    <th>Seats</th>
                                    <th>Occupancy</th>
                                </tr>
                            </thead>
                            <tbody>
                                {occupancyData?.events?.map((e: any) => {
                                    const pct = (e.occupancyRate * 100);
                                    return (
                                        <tr key={e._id}>
                                            <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</td>
                                            <td style={{ color: 'var(--muted)' }}>{e.confirmedRegistrations}/{e.capacity}</td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div className="progress-track" style={{ width: '60px', height: '4px' }}>
                                                        <div className="progress-fill" style={{ width: `${Math.min(pct, 100)}%`, background: 'var(--success)' }} />
                                                    </div>
                                                    <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--success)' }}>{pct.toFixed(1)}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* E: Most used tags — uses $unwind + $group + $sort aggregation pipeline */}
                <div className="panel">
                    <div className="section-header">
                        <span className="section-title">Most Used Tags</span>
                    </div>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Tag</th>
                                <th>Events</th>
                                <th>Distribution</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topTags.map((t: any, idx: number) => (
                                <tr key={t._id}>
                                    <td style={{ color: 'var(--muted)', width: '30px' }}>{idx + 1}</td>
                                    <td><span className="badge-tag">#{t._id}</span></td>
                                    <td style={{ fontWeight: '700' }}>{t.count}</td>
                                    <td>
                                        <div className="progress-track" style={{ width: '80px', height: '4px' }}>
                                            <div className="progress-fill" style={{ width: `${(t.count / maxTagCount) * 100}%`, background: 'var(--primary)' }} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* F: Events by month — uses $group by year/month */}
                <div className="panel">
                    <div className="section-header">
                        <span className="section-title">Events by Month</span>
                    </div>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Period</th>
                                <th>Events</th>
                                <th>Registrations</th>
                                <th>Distribution</th>
                            </tr>
                        </thead>
                        <tbody>
                            {eventsByMonth.map((m: any) => {
                                const barPct = maxMonthRegs > 0 ? (m.totalRegistrations / maxMonthRegs) * 100 : 0;
                                return (
                                    <tr key={`${m._id.year}-${m._id.month}`}>
                                        <td style={{ whiteSpace: 'nowrap', fontWeight: '600' }}>
                                            {MONTH_NAMES[m._id.month - 1]} {m._id.year}
                                        </td>
                                        <td style={{ fontWeight: '700' }}>{m.eventCount}</td>
                                        <td style={{ color: 'var(--muted)' }}>{m.totalRegistrations}</td>
                                        <td>
                                            <div className="progress-track" style={{ width: '80px', height: '4px' }}>
                                                <div className="progress-fill" style={{ width: `${barPct}%`, background: 'var(--primary)' }} />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
