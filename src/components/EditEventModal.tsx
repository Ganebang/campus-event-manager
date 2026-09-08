'use client';

import { useState } from 'react';
import { X, Edit2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EditEventModalProps {
    event: any;
    allUsers: any[];
    handleUpdate: (fd: FormData) => Promise<void>;
}

export default function EditEventModal({ event, allUsers, handleUpdate }: EditEventModalProps) {
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

    const toDatetimeLocal = (date: any) => date ? new Date(date).toISOString().slice(0, 16) : '';

    return (
        <>
            <button id="edit-event-btn" onClick={() => setIsOpen(true)} className="btn-aws-secondary">
                <Edit2 size={13} /> Edit
            </button>

            {isOpen && (
                <div className="aws-modal-overlay" onClick={() => setIsOpen(false)}>
                    <div className="aws-modal" onClick={e => e.stopPropagation()}>
                        <div className="aws-modal-header">
                            <h2 className="aws-modal-title">Edit event</h2>
                            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', alignItems: 'center', padding: '2px' }}>
                                <X size={18} />
                            </button>
                        </div>
                        <div className="aws-modal-body">
                            {error && <div className="aws-alert-error">{error}</div>}

                            <form id="edit-event-form" action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div>
                                    <label className="aws-label">Title <span style={{ color: 'var(--error)' }}>*</span></label>
                                    <input name="title" required defaultValue={event.title} className="aws-input" />
                                </div>
                                <div>
                                    <label className="aws-label">Description <span style={{ color: 'var(--error)' }}>*</span></label>
                                    <textarea name="description" required rows={3} defaultValue={event.description} className="aws-input" style={{ resize: 'vertical' }} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <label className="aws-label">Category <span style={{ color: 'var(--error)' }}>*</span></label>
                                        <select name="category" required defaultValue={event.category} className="aws-select">
                                            {['Hackathon', 'Workshop', 'Talk', 'Meetup', 'Seminar'].map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="aws-label">Capacity <span style={{ color: 'var(--error)' }}>*</span></label>
                                        <input name="capacity" type="number" min="1" required defaultValue={event.capacity} className="aws-input" />
                                    </div>
                                </div>
                                <div>
                                    <label className="aws-label">Tags (comma-separated)</label>
                                    <input name="tags" defaultValue={event.tags?.join(', ')} className="aws-input" />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <label className="aws-label">Start date <span style={{ color: 'var(--error)' }}>*</span></label>
                                        <input name="startDate" type="datetime-local" required defaultValue={toDatetimeLocal(event.startDate)} className="aws-input" />
                                    </div>
                                    <div>
                                        <label className="aws-label">End date <span style={{ color: 'var(--error)' }}>*</span></label>
                                        <input name="endDate" type="datetime-local" required defaultValue={toDatetimeLocal(event.endDate)} className="aws-input" />
                                    </div>
                                </div>
                                <div>
                                    <label className="aws-label">Organizer <span style={{ color: 'var(--error)' }}>*</span></label>
                                    <select name="organizerId" required defaultValue={event.organizerId?.toString()} className="aws-select">
                                        {allUsers.map((o: any) => (
                                            <option key={o._id} value={o._id}>{o.firstName} {o.lastName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--label)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', borderBottom: '1px solid var(--border-light)', paddingBottom: '6px' }}>Location</p>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                                        <div>
                                            <label className="aws-label">Building</label>
                                            <input name="building" required defaultValue={event.location?.building} className="aws-input" />
                                        </div>
                                        <div>
                                            <label className="aws-label">Room</label>
                                            <input name="room" required defaultValue={event.location?.room} className="aws-input" />
                                        </div>
                                        <div>
                                            <label className="aws-label">Campus</label>
                                            <input name="campus" required defaultValue={event.location?.campus} className="aws-input" />
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="aws-modal-footer">
                            <button type="button" onClick={() => setIsOpen(false)} className="btn-aws-secondary">Cancel</button>
                            <button type="submit" form="edit-event-form" disabled={loading} className="btn-aws-primary">
                                {loading ? <><Loader2 size={13} className="animate-spin" /> Saving...</> : 'Save changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
