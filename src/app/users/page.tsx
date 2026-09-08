import { getUsers, getDistinctDepartments } from '@/lib/queries';
import UserFilterBar from '@/components/UserFilterBar';
import CreateUserModal from '@/components/CreateUserModal';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function UsersPage({ searchParams }: any) {
    const resolvedParams = await searchParams || {};

    const [users, departments] = await Promise.all([
        getUsers({
            search:     resolvedParams.search,
            department: resolvedParams.department,
            role:       resolvedParams.role,
        }),
        getDistinctDepartments(),
    ]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Page header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text)', margin: 0 }}>Users</h1>
                    <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>Manage students, faculty, and staff</p>
                </div>
                <CreateUserModal />
            </div>

            {/* Filter bar */}
            <div className="aws-panel" style={{ padding: '10px 16px' }}>
                <UserFilterBar departments={departments} />
            </div>

            {/* Users table */}
            <div className="aws-panel">
                <div className="aws-panel-header">
                    <h2 className="aws-panel-title" style={{ fontSize: '14px' }}>
                        Users <span style={{ fontWeight: '400', color: 'var(--muted)', fontSize: '13px' }}>({users.length})</span>
                    </h2>
                </div>
                <table className="aws-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Department</th>
                            <th>Role</th>
                            <th>Registrations</th>
                            <th>Member since</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
                                    No users match the current filters.
                                </td>
                            </tr>
                        ) : (
                            users.map((user: any) => (
                                <tr key={user._id}>
                                    <td>
                                        <Link href={`/users/${user._id}`} className="aws-link">
                                            {user.firstName} {user.lastName}
                                        </Link>
                                    </td>
                                    <td style={{ color: 'var(--muted)' }}>{user.email}</td>
                                    <td style={{ color: 'var(--muted)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {user.department}
                                    </td>
                                    <td><span className="badge-role">{user.role}</span></td>
                                    <td>
                                        <span style={{ fontWeight: '600' }}>{user.registrationCount}</span>
                                        <span style={{ color: 'var(--muted)' }}> confirmed</span>
                                    </td>
                                    <td style={{ color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                                        {new Date(user.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
