// database/seed.js
const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const dbName = 'campus_events';

// Valid aivancity departments sourced from the official website
const departments = [
    'Grande Ecole Program (PGE)',
    'MSc Data Engineering and Cloud Computing',
    'MSc Data Management',
    'BSc Applied Artificial Intelligence',
    'MSc Artificial Intelligence for Business'
];

// Event constraints
const categories = ['Hackathon', 'Workshop', 'Talk', 'Meetup', 'Seminar'];
const tagsList = ['ai', 'iot', 'green-tech', 'python', 'open-source', 'cloud', 'edge', 'data'];

function randomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

async function seedDB() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db(dbName);

        await db.collection('users').deleteMany({});
        await db.collection('events').deleteMany({});

        console.log('Generating 15 realistic users...');

        // 15 Users extracted from HR Employees Student.xlsx
        const hrUsersData = [
            { firstName: 'Sarah', lastName: 'Renaud' },
            { firstName: 'David', lastName: 'Durand' },
            { firstName: 'Sébastien', lastName: 'Blanc' },
            { firstName: 'Hana', lastName: 'Chevalier' },
            { firstName: 'Emile', lastName: 'Clement' },
            { firstName: 'Thomas', lastName: 'Bernard' },
            { firstName: 'Thérèse', lastName: 'Morel' },
            { firstName: 'François', lastName: 'Simon' },
            { firstName: 'Claire', lastName: 'Laurent' },
            { firstName: 'William', lastName: 'Robert' },
            { firstName: 'Alice', lastName: 'Moreau' },
            { firstName: 'Jean', lastName: 'Garcia' },
            { firstName: 'Ursula', lastName: 'Andre' },
            { firstName: 'Diana', lastName: 'Guerin' },
            { firstName: 'Sébastien', lastName: 'Lefèvre' }
        ];

        const users = hrUsersData.map(u => {
            // Normalize email (remove accents and convert to lowercase)
            const cleanFirst = u.firstName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
            const cleanLast = u.lastName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

            return {
                _id: new ObjectId(),
                firstName: u.firstName,
                lastName: u.lastName,
                email: `${cleanFirst}.${cleanLast}@aivancity.edu`,
                department: randomElement(departments),
                role: 'student',
                interests: [randomElement(tagsList), randomElement(tagsList)],
                createdAt: new Date()
            };
        });

        await db.collection('users').insertMany(users);
        console.log('Users successfully inserted.');

        console.log('Generating 18 events and 40+ registrations...');
        const events = [];
        let totalRegistrations = 0;

        for (let i = 1; i <= 18; i++) {
            const organizer = randomElement(users);
            const isPast = i % 3 === 0;
            const startDate = isPast
                ? new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
                : new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
            const endDate = new Date(startDate.getTime() + 4 * 60 * 60 * 1000);
            const capacity = Math.floor(Math.random() * 15) + 5;

            const registrations = [];
            const numRegs = i === 18 ? 0 : Math.floor(Math.random() * 4) + 1; // Last event has no registrations

            const shuffledUsers = [...users].sort(() => 0.5 - Math.random());

            for (let j = 0; j < numRegs && registrations.length < capacity; j++) {
                registrations.push({
                    userId: shuffledUsers[j]._id,
                    registeredAt: new Date(startDate.getTime() - 24 * 60 * 60 * 1000),
                    status: randomElement(['confirmed', 'waiting', 'cancelled'])
                });
                totalRegistrations++;
            }

            events.push({
                _id: new ObjectId(),
                title: i === 1 ? 'aivancity EcoData & Edge AI Sprint 2026' : `Campus Event ${i}: ${randomElement(categories)}`,
                description: `Join us for an exciting session about ${randomElement(tagsList)}.`,
                category: randomElement(categories),
                tags: [randomElement(tagsList), randomElement(tagsList)],
                startDate: startDate,
                endDate: endDate,
                capacity: capacity,
                location: {
                    building: randomElement(['Innovation Center', 'Main Campus', 'Library']),
                    room: `Room ${i}01`,
                    campus: 'Paris'
                },
                organizerId: organizer._id,
                registrations: registrations,
                createdAt: new Date()
            });
        }

        // Ensure we hit the 40 registrations minimum
        while (totalRegistrations < 40) {
            const randomEvent = randomElement(events);
            if (randomEvent.registrations.length < randomEvent.capacity) {
                randomEvent.registrations.push({
                    userId: randomElement(users)._id,
                    registeredAt: new Date(),
                    status: 'confirmed'
                });
                totalRegistrations++;
            }
        }

        await db.collection('events').insertMany(events);
        console.log(`Successfully seeded ${users.length} users, ${events.length} events, and ${totalRegistrations} registrations!`);

    } finally {
        await client.close();
    }
}

seedDB().catch(console.error);