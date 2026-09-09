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
            <button id="new-event-btn" onClick={() => setIsOpen(true)} className="btn-primary">
                <Plus size={14} /> Create event
            </button>

            {isOpen && (
                <div className="modal-overlay" onClick={() => setIsOpen(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Create event</h2>
                            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', alignItems: 'center', padding: '2px' }}>
                                <X size={18} />
                            </button>
                        </div>
                        <div className="modal-body">
                            {error && <div className="alert-error">{error}</div>}

                            <form id="create-event-form" action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div>
                                    <label className="field-label">Title <span style={{ color: 'var(--error)' }}>*</span></label>
                                    <input name="title" required className="field-input" placeholder="Event title" />
                                </div>

                                <div>
                                    <label className="field-label">Description <span style={{ color: 'var(--error)' }}>*</span></label>
                                    <textarea name="description" required rows={3} className="field-input" style={{ resize: 'vertical' }} placeholder="Event description" />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <label className="field-label">Category <span style={{ color: 'var(--error)' }}>*</span></label>
                                        <select name="category" required className="field-select">
                                            <option value="">Select</option>
                                            {['Hackathon', 'Workshop', 'Talk', 'Meetup', 'Seminar'].map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="field-label">Capacity <span style={{ color: 'var(--error)' }}>*</span></label>
                                        <input name="capacity" type="number" min="1" required className="field-input" placeholder="50" />
                                    </div>
                                </div>

                                <div>
                                    <label className="field-label">Tags <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(comma-separated)</span></label>
                                    <input name="tags" className="field-input" placeholder="ai, python, cloud" />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <label className="field-label">Start date <span style={{ color: 'var(--error)' }}>*</span></label>
                                        <input name="startDate" type="datetime-local" required className="field-input" />
                                    </div>
                                    <div>
                                        <label className="field-label">End date <span style={{ color: 'var(--error)' }}>*</span></label>
                                        <input name="endDate" type="datetime-local" required className="field-input" />
                                    </div>
                                </div>

                                <div>
                                    <label className="field-label">Organizer <span style={{ color: 'var(--error)' }}>*</span></label>
                                    <select name="organizerId" required className="field-select">
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
                                            <label className="field-label">Building <span style={{ color: 'var(--error)' }}>*</span></label>
                                            <input name="building" required className="field-input" placeholder="Innovation Center" />
                                        </div>
                                        <div>
                                            <label className="field-label">Room <span style={{ color: 'var(--error)' }}>*</span></label>
                                            <input name="room" required className="field-input" placeholder="B204" />
                                        </div>
                                        <div>
                                            <label className="field-label">Campus <span style={{ color: 'var(--error)' }}>*</span></label>
                                            <input name="campus" required className="field-input" placeholder="Paris" />
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer">
                            <button type="button" onClick={() => setIsOpen(false)} className="btn-secondary">Cancel</button>
                            <button type="submit" form="create-event-form" disabled={loading} className="btn-primary">
                                {loading ? <><Loader2 size={13} className="animate-spin" /> Creating...</> : 'Create event'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
