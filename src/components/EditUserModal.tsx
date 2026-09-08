'use client';

import { useState } from 'react';
import { X, Edit2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const DEPARTMENTS = [
    'Grande Ecole Program (PGE)',
    'MSc Data Engineering and Cloud Computing',
    'MSc Data Management',
    'BSc Applied Artificial Intelligence',
    'MSc Artificial Intelligence for Business',
];

interface EditUserModalProps {
    user: any;
    handleUpdate: (fd: FormData) => Promise<void>;
}

export default function EditUserModal({ user, handleUpdate }: EditUserModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        setError('');
        try {
            await handleUpdate(formData);
            setIsOpen(false);
            router.refresh();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button id="edit-user-btn" onClick={() => setIsOpen(true)} className="btn-aws-secondary">
                <Edit2 size={13} /> Edit
            </button>

            {isOpen && (
                <div className="aws-modal-overlay" onClick={() => setIsOpen(false)}>
                    <div className="aws-modal" onClick={e => e.stopPropagation()}>
                        <div className="aws-modal-header">
                            <h2 className="aws-modal-title">Edit user</h2>
                            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', padding: '2px' }}>
                                <X size={18} />
                            </button>
                        </div>
                        <div className="aws-modal-body">
                            {error && <div className="aws-alert-error">{error}</div>}

                            <form id="edit-user-form" action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <label className="aws-label">First name <span style={{ color: 'var(--error)' }}>*</span></label>
                                        <input name="firstName" required defaultValue={user.firstName} className="aws-input" />
                                    </div>
                                    <div>
                                        <label className="aws-label">Last name <span style={{ color: 'var(--error)' }}>*</span></label>
                                        <input name="lastName" required defaultValue={user.lastName} className="aws-input" />
                                    </div>
                                </div>
                                <div>
                                    <label className="aws-label">Email <span style={{ color: 'var(--error)' }}>*</span></label>
                                    <input name="email" type="email" required defaultValue={user.email} className="aws-input" />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <label className="aws-label">Department <span style={{ color: 'var(--error)' }}>*</span></label>
                                        <select name="department" required defaultValue={user.department} className="aws-select">
                                            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="aws-label">Role <span style={{ color: 'var(--error)' }}>*</span></label>
                                        <select name="role" defaultValue={user.role} className="aws-select">
                                            <option value="student">Student</option>
                                            <option value="faculty">Faculty</option>
                                            <option value="staff">Staff</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="aws-label">Interests (comma-separated)</label>
                                    <input name="interests" defaultValue={user.interests?.join(', ')} className="aws-input" />
                                </div>
                            </form>
                        </div>
                        <div className="aws-modal-footer">
                            <button type="button" onClick={() => setIsOpen(false)} className="btn-aws-secondary">Cancel</button>
                            <button type="submit" form="edit-user-form" disabled={loading} className="btn-aws-primary">
                                {loading ? <><Loader2 size={13} className="animate-spin" /> Saving...</> : 'Save changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
