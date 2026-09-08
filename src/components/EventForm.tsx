'use client';
import { useState } from 'react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

export default function EventForm({ action, defaultValues, organizers }: any) {
    const [loading, setLoading] = useState(false);

    return (
        <form 
            action={async (fd) => {
                setLoading(true);
                try { await action(fd); } finally { setLoading(false); }
            }} 
            className="space-y-4"
        >
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                    <label className="text-sm font-medium">Title</label>
                    <Input name="title" defaultValue={defaultValues?.title} required />
                </div>
                <div className="space-y-2 col-span-2">
                    <label className="text-sm font-medium">Description</label>
                    <textarea 
                        name="description" 
                        defaultValue={defaultValues?.description} 
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                        rows={3} 
                        required
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <Input name="category" defaultValue={defaultValues?.category} required />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Tags (comma separated)</label>
                    <Input name="tags" defaultValue={defaultValues?.tags?.join(', ')} placeholder="ai, tech, meetup" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Start Date</label>
                    <Input type="datetime-local" name="startDate" defaultValue={defaultValues?.startDate ? new Date(defaultValues.startDate).toISOString().slice(0, 16) : ''} required />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">End Date</label>
                    <Input type="datetime-local" name="endDate" defaultValue={defaultValues?.endDate ? new Date(defaultValues.endDate).toISOString().slice(0, 16) : ''} required />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Capacity</label>
                    <Input type="number" name="capacity" defaultValue={defaultValues?.capacity} min="1" required />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Organizer</label>
                    <select name="organizerId" defaultValue={defaultValues?.organizerId?.toString()} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                        <option value="">Select Organizer</option>
                        {organizers.map((o: any) => (
                            <option key={o._id.toString()} value={o._id.toString()}>{o.firstName} {o.lastName}</option>
                        ))}
                    </select>
                </div>
            </div>
            
            <div className="pt-4 border-t space-y-4">
                <h3 className="font-medium">Location</h3>
                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Building</label>
                        <Input name="building" defaultValue={defaultValues?.location?.building} required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Room</label>
                        <Input name="room" defaultValue={defaultValues?.location?.room} required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Campus</label>
                        <Input name="campus" defaultValue={defaultValues?.location?.campus} required />
                    </div>
                </div>
            </div>

            <div className="pt-6">
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Event'}
                </Button>
            </div>
        </form>
    );
}
