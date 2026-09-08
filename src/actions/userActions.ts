'use server'

import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function createUser(formData: FormData) {
    const client = await clientPromise;
    const db = client.db('campus_events');

    const rawInterests = formData.get('interests') as string;
    const interestsArray = rawInterests.split(',').map(i => i.trim()).filter(Boolean);

    const newUser = {
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        email: formData.get('email') as string,
        department: formData.get('department') as string,
        role: formData.get('role') as string,
        interests: interestsArray,
        createdAt: new Date()
    };

    if (!newUser.email.includes('@')) {
        throw new Error('Invalid email format.');
    }

    try {
        await db.collection('users').insertOne(newUser);
    } catch (e: any) {
        if (e.code === 11000) {
            throw new Error('Email must be unique. This email is already in use.');
        }
        throw e;
    }

    revalidatePath('/users');
}

export async function updateUser(userIdStr: string, formData: FormData) {
    const client = await clientPromise;
    const db = client.db('campus_events');

    const rawInterests = formData.get('interests') as string;
    const interestsArray = rawInterests.split(',').map(i => i.trim()).filter(Boolean);

    const updatedFields = {
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        email: formData.get('email') as string,
        department: formData.get('department') as string,
        role: formData.get('role') as string,
        interests: interestsArray,
    };

    if (!updatedFields.email.includes('@')) {
        throw new Error('Invalid email format.');
    }

    try {
        await db.collection('users').updateOne(
            { _id: new ObjectId(userIdStr) },
            { $set: updatedFields }
        );
    } catch (e: any) {
        if (e.code === 11000) {
            throw new Error('Email must be unique. This email is already in use.');
        }
        throw e;
    }

    revalidatePath(`/users/${userIdStr}`);
    revalidatePath('/users');
}

export async function deleteUser(userIdStr: string) {
    const client = await clientPromise;
    const db = client.db('campus_events');
    const userId = new ObjectId(userIdStr);

    // 1. Referential Integrity Check: Is the user registered for any events?
    const activeRegistrations = await db.collection('events').countDocuments({
        'registrations.userId': userId
    });

    if (activeRegistrations > 0) {
        throw new Error('Cannot delete user: They are currently registered for events. Remove their registrations first.');
    }

    // 2. Perform deletion if safe
    await db.collection('users').deleteOne({ _id: userId });
    revalidatePath('/users');
}
