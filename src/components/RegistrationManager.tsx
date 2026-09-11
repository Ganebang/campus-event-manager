'use client';

import { useState } from 'react';
import { registerForEvent } from '@/actions/registerActions';
import { Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

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
            <div className="flex items-center gap-2 p-3 bg-primary-50 text-primary-700 border border-primary-200 rounded-lg text-sm font-medium">
                <AlertCircle size={16} className="shrink-0" />
                Event is at full capacity. No more registrations can be accepted.
            </div>
        );
    }

    if (availableUsers.length === 0) {
        return (
            <p className="text-sm text-slate-500 font-medium bg-slate-50 p-4 rounded-lg border border-slate-100 text-center">
                All users are already registered for this event.
            </p>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" /> {error}
                </div>
            )}
            <div className="flex gap-2">
                <select
                    id="register-user-select"
                    value={selectedUserId}
                    onChange={e => setSelectedUserId(e.target.value)}
                    disabled={loading}
                    className="flex-1 h-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:border-primary-400 focus-visible:ring-2 focus-visible:ring-primary-200 transition-all shadow-sm"
                >
                    <option value="">Select a user...</option>
                    {availableUsers.map(u => (
                        <option key={u._id} value={u._id}>
                            {u.firstName} {u.lastName} — {u.email}
                        </option>
                    ))}
                </select>
                <Button
                    id="register-btn"
                    onClick={handleRegister}
                    disabled={!selectedUserId || loading}
                    className="shrink-0"
                >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : 'Register'}
                </Button>
            </div>
        </div>
    );
}
