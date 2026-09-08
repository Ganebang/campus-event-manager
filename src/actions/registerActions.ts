'use server'

import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function registerForEvent(eventIdStr: string, userIdStr: string) {
    const client = await clientPromise;
    const db = client.db('campus_events');
    const eventId = new ObjectId(eventIdStr);
    const userId = new ObjectId(userIdStr);

    // 1. Fetch event to check capacity and existing registrations
    const event = await db.collection('events').findOne({ _id: eventId });
    if (!event) throw new Error('Event not found');

    const confirmedRegs = (event.registrations || []).filter((r: any) => r.status === 'confirmed').length;

    // 2. Check Capacity
    if (confirmedRegs >= event.capacity) {
        throw new Error('Event is full. Registration refused.');
    }

    // 3. Prevent duplicate registration
    const isAlreadyRegistered = (event.registrations || []).some((r: any) => r.userId.equals(userId));
    if (isAlreadyRegistered) {
        throw new Error('User is already registered for this event.');
    }

    // 4. Update the array using $push
    await db.collection('events').updateOne(
        { _id: eventId },
        {
            $push: {
                registrations: {
                    userId: userId,
                    registeredAt: new Date(),
                    status: 'confirmed'
                }
            } as any
        }
    );

    revalidatePath(`/events/${eventIdStr}`);
    revalidatePath('/dashboard');
}

export async function cancelRegistration(eventIdStr: string, userIdStr: string) {
    const client = await clientPromise;
    const db = client.db('campus_events');

    // Remove the registration from the array using $pull
    await db.collection('events').updateOne(
        { _id: new ObjectId(eventIdStr) },
        {
            $pull: {
                registrations: { userId: new ObjectId(userIdStr) }
            } as any
        }
    );

    revalidatePath(`/events/${eventIdStr}`);
    revalidatePath('/dashboard');
}
