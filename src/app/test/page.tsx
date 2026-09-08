// src/app/test/page.tsx
import { createEvent } from '@/actions/eventActions';
import { deleteUser } from '@/actions/userActions';

export default function TestPage() {
    return (
        <div className="p-8 space-y-8 max-w-xl mx-auto">
            <h1 className="text-2xl font-bold">Server Actions Test Page</h1>

            {/* Test 1: Create Event Form */}
            <section className="p-4 border rounded-lg bg-gray-50">
                <h2 className="text-lg font-semibold mb-2">Test: Create an Event</h2>
                <form action={createEvent} className="flex flex-col gap-3">
                    <input type="text" name="title" placeholder="Event Title" required className="border p-2" defaultValue="Test AI Event" />
                    <input type="text" name="category" placeholder="Category" required className="border p-2" defaultValue="Hackathon" />
                    <input type="text" name="tags" placeholder="Tags (comma separated)" className="border p-2" defaultValue="ai, test, nextjs" />
                    <input type="date" name="startDate" required className="border p-2" defaultValue="2026-10-01" />
                    <input type="date" name="endDate" required className="border p-2" defaultValue="2026-10-02" />
                    <input type="number" name="capacity" placeholder="Capacity" required className="border p-2" defaultValue="50" />

                    {/* Location fields */}
                    <input type="text" name="building" placeholder="Building" className="border p-2" defaultValue="Innovation Center" />
                    <input type="text" name="room" placeholder="Room" className="border p-2" defaultValue="101" />
                    <input type="text" name="campus" placeholder="Campus" className="border p-2" defaultValue="Paris" />

                    {/* Dummy Organizer ID (must be a valid 24-character hex string for ObjectId) */}
                    <input type="text" name="organizerId" placeholder="Organizer ID" required className="border p-2" defaultValue="507f1f77bcf86cd799439011" />

                    <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
                        Create Event (Trigger Server Action)
                    </button>
                </form>
            </section>

            {/* Test 2: Delete User Action */}
            <section className="p-4 border rounded-lg bg-red-50">
                <h2 className="text-lg font-semibold text-red-700 mb-2">Test: Delete a User</h2>
                <p className="text-sm text-gray-600 mb-2">
                    Paste a valid User ID from your database here. It will fail if they have active registrations!
                </p>
                <form action={async (formData) => {
                    'use server';
                    const id = formData.get('userId') as string;
                    await deleteUser(id);
                }} className="flex flex-col gap-3">
                    <input type="text" name="userId" placeholder="Paste a User ID here" required className="border p-2" />
                    <button type="submit" className="bg-red-600 text-white p-2 rounded hover:bg-red-700">
                        Delete User
                    </button>
                </form>
            </section>
        </div>
    );
}