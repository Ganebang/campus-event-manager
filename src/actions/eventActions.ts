'use server'

import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { CampusEvent } from '@/types';

export async function createEvent(formData: FormData) {
    const client = await clientPromise;
    const db = client.db('campus_events');

    const rawTags = formData.get('tags') as string;
    const tagsArray = rawTags.split(',').map(tag => tag.trim()).filter(Boolean);

    const newEvent: Omit<CampusEvent, '_id' | 'createdAt'> & { createdAt: Date } = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        category: formData.get('category') as string,
        tags: tagsArray,
        startDate: new Date(formData.get('startDate') as string),
        endDate: new Date(formData.get('endDate') as string),
        capacity: parseInt(formData.get('capacity') as string, 10),
        location: {
            building: formData.get('building') as string,
            room: formData.get('room') as string,
            campus: formData.get('campus') as string,
        },
        organizerId: new ObjectId(formData.get('organizerId') as string),
        registrations: [],
        createdAt: new Date(),
    };

    if (newEvent.endDate < newEvent.startDate) {
        throw new Error('End date cannot be before start date.');
    }
    if (newEvent.capacity <= 0) {
        throw new Error('Capacity must be greater than 0.');
    }
    if (!newEvent.title) {
        throw new Error('Event title cannot be empty.');
    }

    await db.collection('events').insertOne(newEvent);
    revalidatePath('/events');
}

export async function updateEvent(eventIdStr: string, formData: FormData) {
    const client = await clientPromise;
    const db = client.db('campus_events');

    const rawTags = formData.get('tags') as string;
    const tagsArray = rawTags.split(',').map(tag => tag.trim()).filter(Boolean);

    const updatedFields = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        category: formData.get('category') as string,
        tags: tagsArray,
        startDate: new Date(formData.get('startDate') as string),
        endDate: new Date(formData.get('endDate') as string),
        capacity: parseInt(formData.get('capacity') as string, 10),
        location: {
            building: formData.get('building') as string,
            room: formData.get('room') as string,
            campus: formData.get('campus') as string,
        }
    };

    if (updatedFields.endDate < updatedFields.startDate) {
        throw new Error('End date cannot be before start date.');
    }
    if (updatedFields.capacity <= 0) {
        throw new Error('Capacity must be greater than 0.');
    }
    if (!updatedFields.title) {
        throw new Error('Event title cannot be empty.');
    }

    await db.collection('events').updateOne(
        { _id: new ObjectId(eventIdStr) },
        { $set: updatedFields }
    );
    revalidatePath(`/events/${eventIdStr}`);
    revalidatePath('/events');
}

export async function deleteEvent(eventIdStr: string) {
    const client = await clientPromise;
    const db = client.db('campus_events');

    await db.collection('events').deleteOne({ _id: new ObjectId(eventIdStr) });
    revalidatePath('/events');
}