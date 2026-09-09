'use client';

import { useState } from 'react';
import { registerForEvent } from '@/actions/registerActions';
import { Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AvailableUser {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
}

interface RegistrationManagerProps {
    eventId: string;
    availableUsers: AvailableUser[];
    isFull: boolean;
}

export default function RegistrationManager({ eventId, availableUsers, isFull }: RegistrationManagerProps) {
    const [selectedUserId, setSelectedUserId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleRegister = async () => {
        if (!selectedUserId) return;
        setLoading(true);
        setError('');
        try {
            await registerForEvent(eventId, selectedUserId);
            setSelectedUserId('');
            router.refresh();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    if (isFull) {
        return (
            <div className="alert-info" style={{ marginBottom: 0 }}>
                <AlertCircle size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
                Event is at full capacity. No more registrations can be accepted.
            </div>
        );
    }

    if (availableUsers.length === 0) {
        return (
            <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
                All users are already registered for this event.
            </p>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {error && (
                <div className="alert-error" style={{ marginBottom: 0 }}>
                    <AlertCircle size={14} style={{ flexShrink: 0 }} /> {error}
                </div>
            )}
            <div style={{ display: 'flex', gap: '8px' }}>
                <select
                    id="register-user-select"
                    value={selectedUserId}
                    onChange={e => setSelectedUserId(e.target.value)}
                    disabled={loading}
                    className="field-select"
                    style={{ flex: 1 }}
                >
                    <option value="">Select a user...</option>
                    {availableUsers.map(u => (
                        <option key={u._id} value={u._id}>
                            {u.firstName} {u.lastName} — {u.email}
                        </option>
                    ))}
                </select>
                <button
                    id="register-btn"
                    onClick={handleRegister}
                    disabled={!selectedUserId || loading}
                    className="btn-primary"
                    style={{ flexShrink: 0 }}
                >
                    {loading ? <Loader2 size={13} className="animate-spin" /> : 'Register'}
                </button>
            </div>
        </div>
    );
}
