import Link from 'next/link';
import { CampusEvent } from '@/types';
import { Calendar, MapPin, Users, Tag } from 'lucide-react';

interface EventCardProps {
    event: CampusEvent & { _id: any; registrations?: Array<{ status: string }> };
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
    Hackathon: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-100', dot: '#4f46e5' },
    Workshop:  { bg: 'bg-cyan-50',   text: 'text-cyan-700',   border: 'border-cyan-100',   dot: '#0891b2' },
    Talk:      { bg: 'bg-emerald-50',text: 'text-emerald-700',border: 'border-emerald-100',dot: '#059669' },
    Meetup:    { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-100',  dot: '#d97706' },
    Seminar:   { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-100', dot: '#7c3aed' },
};

const DEFAULT_CATEGORY_COLOR = { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-100', dot: '#64748b' };

export default function EventCard({ event }: EventCardProps) {
    const isPast = new Date(event.startDate) < new Date();
    const confirmedCount = event.registrations?.filter(r => r.status === 'confirmed').length || 0;
    const isFull = confirmedCount >= event.capacity;
    const occupancyPercent = event.capacity > 0 ? Math.round((confirmedCount / event.capacity) * 100) : 0;
    const categoryStyle = CATEGORY_COLORS[event.category] || DEFAULT_CATEGORY_COLOR;

    return (
        <div className={`group flex flex-col rounded-xl bg-white border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 ${isPast ? 'opacity-70' : ''}`}>

            {/* Color Header */}
            <div className="h-2 w-full" style={{ background: categoryStyle.dot }} />

            <div className="p-4 flex flex-col flex-1 gap-3">
                {/* Category + Status badges */}
                <div className="flex items-center justify-between gap-2">
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border}`}>
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: categoryStyle.dot }} />
                        {event.category}
                    </span>
                    {isFull ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-100 text-red-700 border border-red-200 uppercase tracking-wide">Full</span>
                    ) : isPast ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200 uppercase tracking-wide">Past</span>
                    ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary-100 text-primary-700 border border-primary-200 uppercase tracking-wide">Upcoming</span>
                    )}
                </div>

                {/* Title */}
                <Link href={`/events/${event._id}`} className="font-bold text-slate-900 hover:text-indigo-600 transition-colors leading-snug line-clamp-2 text-sm">
                    {event.title}
                </Link>

                {/* Meta info */}
                <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span>{new Date(event.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{event.location.building} · {event.location.room}</span>
                    </div>
                </div>

                {/* Tags */}
                {event.tags && event.tags.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap">
                        <Tag className="w-3 h-3 text-slate-400 shrink-0" />
                        {event.tags.slice(0, 3).map((tag: string) => (
                            <span key={tag} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">{tag}</span>
                        ))}
                    </div>
                )}

                {/* Occupancy bar */}
                <div className="border-t border-slate-100 pt-3">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="flex items-center gap-1 text-slate-500">
                            <Users className="w-3.5 h-3.5" />
                            <span className="font-semibold text-slate-700">{confirmedCount}</span>
                            <span>/ {event.capacity} seats</span>
                        </span>
                        <span className={`font-bold text-xs ${isFull ? 'text-red-600' : occupancyPercent >= 80 ? 'text-amber-600' : 'text-slate-500'}`}>
                            {occupancyPercent}%
                        </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                                width: `${Math.min(occupancyPercent, 100)}%`,
                                background: isFull ? '#ef4444' : occupancyPercent >= 80 ? '#f59e0b' : categoryStyle.dot
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
