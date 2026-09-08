import { ObjectId } from 'mongodb';

export interface Location {
    building: string;
    room: string;
    campus: string;
}

export interface Registration {
    userId: ObjectId;
    registeredAt: Date;
    status: 'confirmed' | 'cancelled' | 'waiting';
}

export interface CampusEvent {
    _id?: ObjectId;
    title: string;
    description: string;
    category: string;
    tags: string[];
    startDate: Date;
    endDate: Date;
    capacity: number;
    location: Location;
    organizerId: ObjectId;
    registrations: Registration[];
    createdAt: Date;
}

export interface User {
    _id?: ObjectId;
    firstName: string;
    lastName: string;
    email: string;
    department: string;
    role: string;
    interests: string[];
    createdAt: Date;
}
