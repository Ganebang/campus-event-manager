'use client';
import { useState } from 'react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

export default function UserForm({ action, defaultValues }: any) {
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
                <div className="space-y-2">
                    <label className="text-sm font-medium">First Name</label>
                    <Input name="firstName" defaultValue={defaultValues?.firstName} required />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Last Name</label>
                    <Input name="lastName" defaultValue={defaultValues?.lastName} required />
                </div>
                <div className="space-y-2 col-span-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input type="email" name="email" defaultValue={defaultValues?.email} required />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Department</label>
                    <Input name="department" defaultValue={defaultValues?.department} required />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Role</label>
                    <select name="role" defaultValue={defaultValues?.role || 'student'} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <option value="student">Student</option>
                        <option value="faculty">Faculty</option>
                        <option value="staff">Staff</option>
                    </select>
                </div>
                <div className="space-y-2 col-span-2">
                    <label className="text-sm font-medium">Interests (comma separated)</label>
                    <Input name="interests" defaultValue={defaultValues?.interests?.join(', ')} placeholder="ai, data, cloud" />
                </div>
            </div>
            <div className="pt-6">
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Saving...' : 'Save User'}
                </Button>
            </div>
        </form>
    );
}
