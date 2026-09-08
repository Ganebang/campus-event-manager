'use client';

import { useState } from 'react';
import { createEvent } from '@/actions/eventActions';
import { X, Plus, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CreateEventModalProps {
    organizers: Array<{ _id: string; firstName: string; lastName: string }>;
}

export default function CreateEventModal({ organizers }: CreateEventModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        setError('');
        try {
            await createEvent(formData);
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
            <button id="new-event-btn" onClick={() => setIsOpen(true)} className="btn-aws-primary">
                <Plus size={14} /> Create event
            </button>

            {isOpen && (
                <div className="aws-modal-overlay" onClick={() => setIsOpen(false)}>
                    <div className="aws-modal" onClick={e => e.stopPropagation()}>
                        <div className="aws-modal-header">
                            <h2 className="aws-modal-title">Create event</h2>
                            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', alignItems: 'center', padding: '2px' }}>
                                <X size={18} />
                            </button>
                        </div>
                        <div className="aws-modal-body">
                            {error && <div className="aws-alert-error">{error}</div>}

                            <form id="create-event-form" action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div>
                                    <label className="aws-label">Title <span style={{ color: 'var(--error)' }}>*</span></label>
                                    <input name="title" required className="aws-input" placeholder="Event title" />
                                </div>

                                <div>
                                    <label className="aws-label">Description <span style={{ color: 'var(--error)' }}>*</span></label>
                                    <textarea name="description" required rows={3} className="aws-input" style={{ resize: 'vertical' }} placeholder="Event description" />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <label className="aws-label">Category <span style={{ color: 'var(--error)' }}>*</span></label>
                                        <select name="category" required className="aws-select">
                                            <option value="">Select</option>
                                            {['Hackathon', 'Workshop', 'Talk', 'Meetup', 'Seminar'].map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="aws-label">Capacity <span style={{ color: 'var(--error)' }}>*</span></label>
                                        <input name="capacity" type="number" min="1" required className="aws-input" placeholder="50" />
                                    </div>
                                </div>

                                <div>
                                    <label className="aws-label">Tags <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(comma-separated)</span></label>
                                    <input name="tags" className="aws-input" placeholder="ai, python, cloud" />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <label className="aws-label">Start date <span style={{ color: 'var(--error)' }}>*</span></label>
                                        <input name="startDate" type="datetime-local" required className="aws-input" />
                                    </div>
                                    <div>
                                        <label className="aws-label">End date <span style={{ color: 'var(--error)' }}>*</span></label>
                                        <input name="endDate" type="datetime-local" required className="aws-input" />
                                    </div>
                                </div>

                                <div>
                                    <label className="aws-label">Organizer <span style={{ color: 'var(--error)' }}>*</span></label>
                                    <select name="organizerId" required className="aws-select">
                                        <option value="">Select organizer</option>
                                        {organizers.map(o => (
                                            <option key={o._id} value={o._id}>{o.firstName} {o.lastName}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--label)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', borderBottom: '1px solid var(--border-light)', paddingBottom: '6px' }}>Location</p>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                                        <div>
                                            <label className="aws-label">Building <span style={{ color: 'var(--error)' }}>*</span></label>
                                            <input name="building" required className="aws-input" placeholder="Innovation Center" />
                                        </div>
                                        <div>
                                            <label className="aws-label">Room <span style={{ color: 'var(--error)' }}>*</span></label>
                                            <input name="room" required className="aws-input" placeholder="B204" />
                                        </div>
                                        <div>
                                            <label className="aws-label">Campus <span style={{ color: 'var(--error)' }}>*</span></label>
                                            <input name="campus" required className="aws-input" placeholder="Paris" />
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="aws-modal-footer">
                            <button type="button" onClick={() => setIsOpen(false)} className="btn-aws-secondary">Cancel</button>
                            <button type="submit" form="create-event-form" disabled={loading} className="btn-aws-primary">
                                {loading ? <><Loader2 size={13} className="animate-spin" /> Creating...</> : 'Create event'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
