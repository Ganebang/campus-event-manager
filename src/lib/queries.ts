import { ObjectId } from 'mongodb';
import clientPromise from './db';

function serializeMongo(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (obj instanceof ObjectId) return obj.toString();
    if (Array.isArray(obj)) return obj.map(serializeMongo);
    if (typeof obj === 'object') {
        if (obj instanceof Date) return obj;
        const result: any = {};
        for (const key in obj) {
            result[key] = serializeMongo(obj[key]);
        }
        return result;
    }
    return obj;
}

// ==========================================
// DASHBOARD QUERIES (Page 1)
// ==========================================
export async function getDashboardStats() {
    const client = await clientPromise;
    const db = client.db('campus_events');

    const totalUsers = await db.collection('users').countDocuments();
    const totalEvents = await db.collection('events').countDocuments();
    const upcomingEvents = await db.collection('events').countDocuments({ startDate: { $gte: new Date() } });

    const registrationAggResult = await db.collection('events').aggregate([
        { $project: { confirmedCount: { $size: { $filter: { input: { $ifNull: ['$registrations', []] }, as: 'r', cond: { $eq: ['$$r.status', 'confirmed'] } } } } } },
        { $group: { _id: null, total: { $sum: '$confirmedCount' } } }
    ]).toArray();
    const totalRegistrations = registrationAggResult[0]?.total || 0;

    return { totalUsers, totalEvents, upcomingEvents, totalRegistrations };
}

export async function getNextUpcomingEvents(limit = 5) {
    const client = await clientPromise;
    const db = client.db('campus_events');

    const events = await db.collection('events')
        .find({ startDate: { $gte: new Date() } })
        .sort({ startDate: 1 })
        .limit(limit)
        .toArray();
    return serializeMongo(events);
}

export async function getMostPopularEvent() {
    const client = await clientPromise;
    const db = client.db('campus_events');

    const result = await db.collection('events').aggregate([
        {
            $addFields: {
                confirmedRegistrations: {
                    $size: {
                        $filter: {
                            input: { $ifNull: ['$registrations', []] },
                            as: 'reg',
                            cond: { $eq: ['$$reg.status', 'confirmed'] }
                        }
                    }
                }
            }
        },
        { $sort: { confirmedRegistrations: -1 } },
        { $limit: 1 }
    ]).toArray();

    return serializeMongo(result[0] || null);
}

export async function getCategoryBreakdown() {
    const client = await clientPromise;
    const db = client.db('campus_events');

    const results = await db.collection('events').aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ]).toArray();
    return serializeMongo(results);
}

// ==========================================
// EVENTS QUERIES (Page 2 & 3)
// ==========================================
export async function getEvents(filters: { search?: string; category?: string; tag?: string; timeframe?: string; sort?: string }) {
    const client = await clientPromise;
    const db = client.db('campus_events');

    const mongoQuery: any = {};
    if (filters.search) {
        mongoQuery.title = { $regex: filters.search, $options: 'i' };
    }
    if (filters.category) {
        mongoQuery.category = filters.category;
    }
    if (filters.tag) {
        mongoQuery.tags = filters.tag;
    }
    if (filters.timeframe === 'upcoming') {
        mongoQuery.startDate = { $gte: new Date() };
    } else if (filters.timeframe === 'past') {
        mongoQuery.startDate = { $lt: new Date() };
    }

    const sortOrder = filters.sort === 'desc' ? -1 : 1;
    const events = await db.collection('events').find(mongoQuery).sort({ startDate: sortOrder }).toArray();
    return serializeMongo(events);
}

export async function getDistinctCategories(): Promise<string[]> {
    const client = await clientPromise;
    const db = client.db('campus_events');
    const categories = await db.collection('events').distinct('category');
    return categories.sort();
}

export async function getDistinctTags(): Promise<string[]> {
    const client = await clientPromise;
    const db = client.db('campus_events');
    const tags = await db.collection('events').distinct('tags');
    return tags.sort();
}

export async function getEventById(id: string) {
    const client = await clientPromise;
    const db = client.db('campus_events');

    const result = await db.collection('events').aggregate([
        { $match: { _id: new ObjectId(id) } },
        {
            $lookup: {
                from: 'users',
                localField: 'organizerId',
                foreignField: '_id',
                as: 'organizerInfo'
            }
        },
        { $unwind: { path: '$organizerInfo', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'users',
                localField: 'registrations.userId',
                foreignField: '_id',
                as: 'registeredUsersData'
            }
        }
    ]).toArray();

    return serializeMongo(result[0] || null);
}

// ==========================================
// USERS QUERIES (Page 4)
// ==========================================
export async function getUsers(filters: { search?: string; department?: string; role?: string } = {}) {
    const client = await clientPromise;
    const db = client.db('campus_events');

    const mongoQuery: any = {};
    if (filters.search) {
        mongoQuery.$or = [
            { firstName: { $regex: filters.search, $options: 'i' } },
            { lastName: { $regex: filters.search, $options: 'i' } },
            { email: { $regex: filters.search, $options: 'i' } }
        ];
    }
    if (filters.department) {
        mongoQuery.department = filters.department;
    }
    if (filters.role) {
        mongoQuery.role = filters.role;
    }

    const users = await db.collection('users').aggregate([
        { $match: mongoQuery },
        {
            $lookup: {
                from: 'events',
                let: { userId: '$_id' },
                pipeline: [
                    { $match: { $expr: { $in: ['$$userId', '$registrations.userId'] } } },
                    { $unwind: '$registrations' },
                    { $match: { $expr: { $and: [{ $eq: ['$$userId', '$registrations.userId'] }, { $eq: ['$registrations.status', 'confirmed'] }] } } },
                    { $count: 'count' }
                ],
                as: 'confirmedRegCount'
            }
        },
        {
            $addFields: {
                registrationCount: { $ifNull: [{ $arrayElemAt: ['$confirmedRegCount.count', 0] }, 0] }
            }
        },
        { $project: { confirmedRegCount: 0 } },
        { $sort: { firstName: 1 } }
    ]).toArray();

    return serializeMongo(users);
}

export async function getUserById(id: string) {
    const client = await clientPromise;
    const db = client.db('campus_events');

    const result = await db.collection('users').aggregate([
        { $match: { _id: new ObjectId(id) } },
        {
            $lookup: {
                from: 'events',
                localField: '_id',
                foreignField: 'registrations.userId',
                as: 'registeredEvents'
            }
        }
    ]).toArray();

    return serializeMongo(result[0] || null);
}

export async function getAllUsersBasic() {
    const client = await clientPromise;
    const db = client.db('campus_events');
    const users = await db.collection('users').find({}, { projection: { firstName: 1, lastName: 1, email: 1 } }).toArray();
    return serializeMongo(users);
}

export async function getDistinctDepartments(): Promise<string[]> {
    const client = await clientPromise;
    const db = client.db('campus_events');
    const departments = await db.collection('users').distinct('department');
    return departments.sort();
}

// ==========================================
// ANALYTICS QUERIES (Page 5)
// ==========================================

// Analysis A — Registrations by Category
export async function getRegistrationsByCategory() {
    const client = await clientPromise;
    const db = client.db('campus_events');

    const results = await db.collection('events').aggregate([
        {
            $project: {
                category: 1,
                confirmedCount: {
                    $size: {
                        $filter: {
                            input: { $ifNull: ['$registrations', []] },
                            as: 'reg',
                            cond: { $eq: ['$$reg.status', 'confirmed'] }
                        }
                    }
                }
            }
        },
        {
            $group: {
                _id: '$category',
                eventCount: { $sum: 1 },
                totalRegistrations: { $sum: '$confirmedCount' }
            }
        },
        { $sort: { totalRegistrations: -1 } }
    ]).toArray();
    return serializeMongo(results);
}

// Analysis B — Top 5 Most Popular Events
export async function getTop5PopularEvents() {
    const client = await clientPromise;
    const db = client.db('campus_events');

    const results = await db.collection('events').aggregate([
        {
            $addFields: {
                confirmedRegistrations: {
                    $size: {
                        $filter: {
                            input: { $ifNull: ['$registrations', []] },
                            as: 'reg',
                            cond: { $eq: ['$$reg.status', 'confirmed'] }
                        }
                    }
                }
            }
        },
        {
            $addFields: {
                occupancyPercentage: {
                    $cond: [
                        { $gt: ['$capacity', 0] },
                        { $multiply: [{ $divide: ['$confirmedRegistrations', '$capacity'] }, 100] },
                        0
                    ]
                }
            }
        },
        { $sort: { confirmedRegistrations: -1 } },
        { $limit: 5 },
        { $project: { title: 1, category: 1, capacity: 1, confirmedRegistrations: 1, occupancyPercentage: 1 } }
    ]).toArray();
    return serializeMongo(results);
}

// Analysis C — Users With No Registration (uses $lookup + $match)
export async function getUsersWithNoRegistration() {
    const client = await clientPromise;
    const db = client.db('campus_events');

    const results = await db.collection('users').aggregate([
        {
            $lookup: {
                from: 'events',
                localField: '_id',
                foreignField: 'registrations.userId',
                as: 'participatedEvents'
            }
        },
        { $match: { participatedEvents: { $size: 0 } } },
        { $project: { firstName: 1, lastName: 1, email: 1, department: 1, role: 1 } }
    ]).toArray();
    return serializeMongo(results);
}

// Analysis D — Events Above Average Occupancy
export async function getEventsAboveAverageOccupancy() {
    const client = await clientPromise;
    const db = client.db('campus_events');

    const result = await db.collection('events').aggregate([
        {
            $addFields: {
                confirmedRegistrations: {
                    $size: {
                        $filter: {
                            input: { $ifNull: ['$registrations', []] },
                            as: 'reg',
                            cond: { $eq: ['$$reg.status', 'confirmed'] }
                        }
                    }
                }
            }
        },
        {
            $addFields: {
                occupancyRate: {
                    $cond: [
                        { $gt: ['$capacity', 0] },
                        { $divide: ['$confirmedRegistrations', '$capacity'] },
                        0
                    ]
                }
            }
        },
        {
            $facet: {
                averageData: [
                    { $group: { _id: null, avgOccupancy: { $avg: '$occupancyRate' } } }
                ],
                allEvents: [
                    { $project: { title: 1, capacity: 1, confirmedRegistrations: 1, occupancyRate: 1 } }
                ]
            }
        },
        {
            $project: {
                avgOccupancy: { $arrayElemAt: ['$averageData.avgOccupancy', 0] },
                events: {
                    $filter: {
                        input: '$allEvents',
                        as: 'ev',
                        cond: { $gt: ['$$ev.occupancyRate', { $arrayElemAt: ['$averageData.avgOccupancy', 0] }] }
                    }
                }
            }
        }
    ]).toArray();

    return serializeMongo(result[0]);
}

// Analysis E — Most Used Tags (uses $unwind + $group)
export async function getMostUsedTags() {
    const client = await clientPromise;
    const db = client.db('campus_events');

    const results = await db.collection('events').aggregate([
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ]).toArray();
    return serializeMongo(results);
}

// Analysis F — Events by Month
export async function getEventsByMonth() {
    const client = await clientPromise;
    const db = client.db('campus_events');

    const results = await db.collection('events').aggregate([
        {
            $addFields: {
                monthNumber: { $month: '$startDate' },
                yearNumber: { $year: '$startDate' },
                totalRegistrations: { $size: { $ifNull: ['$registrations', []] } }
            }
        },
        {
            $group: {
                _id: { year: '$yearNumber', month: '$monthNumber' },
                eventCount: { $sum: 1 },
                totalRegistrations: { $sum: '$totalRegistrations' }
            }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]).toArray();
    return serializeMongo(results);
}
