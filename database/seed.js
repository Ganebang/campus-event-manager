const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const dbName = 'campus_events';

const departments = [
    'Grande Ecole Program (PGE)',
    'MSc Data Engineering and Cloud Computing',
    'MSc Data Management',
    'BSc Applied Artificial Intelligence',
    'MSc Artificial Intelligence for Business'
];

const categories = ['Hackathon', 'Workshop', 'Talk', 'Meetup', 'Seminar'];

const tagsList = ['ai', 'iot', 'green-tech', 'python', 'open-source', 'cloud', 'edge', 'data'];

const eventTemplates = [
    { title: 'aivancity EcoData & Edge AI Sprint 2026', category: 'Hackathon', tags: ['ai', 'edge'], daysOffset: 42 },
    { title: 'Introduction to Cloud Computing with AWS', category: 'Workshop', tags: ['cloud', 'python'], daysOffset: 15 },
    { title: 'Green Tech & Sustainable AI Panel', category: 'Talk', tags: ['green-tech', 'ai'], daysOffset: -35 },
    { title: 'Open Source Contribution Bootcamp', category: 'Workshop', tags: ['open-source', 'python'], daysOffset: 25 },
    { title: 'Data Engineering with Apache Spark', category: 'Seminar', tags: ['data', 'cloud'], daysOffset: -60 },
    { title: 'IoT & Edge Computing Meetup', category: 'Meetup', tags: ['iot', 'edge'], daysOffset: 60 },
    { title: 'AI Ethics: Responsible Innovation Forum', category: 'Talk', tags: ['ai', 'open-source'], daysOffset: -15 },
    { title: 'Python for Data Science — Hands-on Session', category: 'Workshop', tags: ['python', 'data'], daysOffset: 5 },
    { title: '24h Hackathon: Smart City Solutions', category: 'Hackathon', tags: ['iot', 'ai'], daysOffset: 90 },
    { title: 'MongoDB & NoSQL Databases Deep Dive', category: 'Seminar', tags: ['data', 'open-source'], daysOffset: -45 },
    { title: 'Entrepreneurship in Deep Tech', category: 'Talk', tags: ['ai', 'green-tech'], daysOffset: 30 },
    { title: 'Machine Learning Model Deployment', category: 'Workshop', tags: ['ai', 'cloud'], daysOffset: -20 },
    { title: 'Campus Tech Meetup — Spring Edition', category: 'Meetup', tags: ['open-source', 'python'], daysOffset: 10 },
    { title: 'Federated Learning & Privacy-Preserving AI', category: 'Seminar', tags: ['ai', 'data'], daysOffset: 75 },
    { title: 'Edge AI on Raspberry Pi Workshop', category: 'Workshop', tags: ['edge', 'iot'], daysOffset: -80 },
    { title: 'Data Governance & GDPR Compliance', category: 'Talk', tags: ['data', 'green-tech'], daysOffset: 20 },
    { title: 'Hackathon for Good: Climate Solutions', category: 'Hackathon', tags: ['green-tech', 'ai'], daysOffset: -5 },
    { title: 'Career Fair — AI & Data Science Sector', category: 'Meetup', tags: ['ai', 'cloud'], daysOffset: 50 }
];

const hrUsersData = [
    { firstName: 'Sarah',     lastName: 'Renaud',   role: 'student' },
    { firstName: 'David',     lastName: 'Durand',   role: 'faculty' },
    { firstName: 'Sebastien', lastName: 'Blanc',    role: 'student' },
    { firstName: 'Hana',      lastName: 'Chevalier',role: 'student' },
    { firstName: 'Emile',     lastName: 'Clement',  role: 'student' },
    { firstName: 'Thomas',    lastName: 'Bernard',  role: 'staff' },
    { firstName: 'Therese',   lastName: 'Morel',    role: 'student' },
    { firstName: 'Francois',  lastName: 'Simon',    role: 'faculty' },
    { firstName: 'Claire',    lastName: 'Laurent',  role: 'student' },
    { firstName: 'William',   lastName: 'Robert',   role: 'student' },
    { firstName: 'Alice',     lastName: 'Moreau',   role: 'staff' },
    { firstName: 'Jean',      lastName: 'Garcia',   role: 'student' },
    { firstName: 'Ursula',    lastName: 'Andre',    role: 'student' },
    { firstName: 'Diana',     lastName: 'Guerin',   role: 'faculty' },
    { firstName: 'Sebastien', lastName: 'Lefevre',  role: 'student' }
];

function randomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomTwoDistinctElements(arr) {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return [shuffled[0], shuffled[1]];
}

async function seedDB() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db(dbName);

        await db.collection('users').deleteMany({});
        await db.collection('events').deleteMany({});

        console.log('Inserting 15 users...');

        const users = hrUsersData.map(u => ({
            _id: new ObjectId(),
            firstName: u.firstName,
            lastName: u.lastName,
            email: `${u.firstName.toLowerCase()}.${u.lastName.toLowerCase()}@aivancity.edu`,
            department: randomElement(departments),
            role: u.role,
            interests: randomTwoDistinctElements(tagsList),
            createdAt: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000)
        }));

        await db.collection('users').insertMany(users);
        console.log(`Inserted ${users.length} users.`);

        console.log('Inserting 18 events...');

        const events = eventTemplates.map((template, index) => {
            const organizer = users[index % users.length];
            const startDate = new Date(Date.now() + template.daysOffset * 24 * 60 * 60 * 1000);
            const endDate = new Date(startDate.getTime() + 4 * 60 * 60 * 1000);
            const capacity = Math.floor(Math.random() * 20) + 10;

            return {
                _id: new ObjectId(),
                title: template.title,
                description: `Join us for an in-depth session on ${template.tags.join(' and ')}. This event is open to all members of the aivancity community.`,
                category: template.category,
                tags: template.tags,
                startDate,
                endDate,
                capacity,
                location: {
                    building: randomElement(['Innovation Center', 'Main Building', 'Digital Lab', 'Library Annex']),
                    room: `Room ${String.fromCharCode(65 + (index % 6))}${101 + (index % 5)}`,
                    campus: 'Paris'
                },
                organizerId: organizer._id,
                registrations: [],
                createdAt: new Date(startDate.getTime() - 30 * 24 * 60 * 60 * 1000)
            };
        });

        // Distribute registrations — guaranteed 40+ confirmed, skip the last event (index 17)
        let totalConfirmed = 0;
        const eventsWithRegistrations = events.slice(0, 17);

        for (const event of eventsWithRegistrations) {
            const numberOfRegistrations = Math.floor(Math.random() * 5) + 2;
            const shuffledUsers = [...users].sort(() => 0.5 - Math.random());

            for (let j = 0; j < numberOfRegistrations && j < event.capacity; j++) {
                event.registrations.push({
                    userId: shuffledUsers[j]._id,
                    registeredAt: new Date(event.startDate.getTime() - (7 + j) * 24 * 60 * 60 * 1000),
                    status: 'confirmed'
                });
                totalConfirmed++;
            }
        }

        // Top up to ensure we have at least 40 confirmed registrations
        while (totalConfirmed < 40) {
            const targetEvent = eventsWithRegistrations[Math.floor(Math.random() * eventsWithRegistrations.length)];
            const currentRegisteredUserIds = targetEvent.registrations.map(r => r.userId.toString());
            const unregisteredUsers = users.filter(u => !currentRegisteredUserIds.includes(u._id.toString()));

            if (unregisteredUsers.length > 0 && targetEvent.registrations.length < targetEvent.capacity) {
                targetEvent.registrations.push({
                    userId: randomElement(unregisteredUsers)._id,
                    registeredAt: new Date(targetEvent.startDate.getTime() - 3 * 24 * 60 * 60 * 1000),
                    status: 'confirmed'
                });
                totalConfirmed++;
            } else {
                break;
            }
        }

        await db.collection('events').insertMany(events);
        console.log(`Inserted ${events.length} events with ${totalConfirmed} confirmed registrations.`);
        console.log('Event 18 (Career Fair) has 0 registrations by design.');
        console.log('Seed complete!');

    } finally {
        await client.close();
    }
}

seedDB().catch(console.error);