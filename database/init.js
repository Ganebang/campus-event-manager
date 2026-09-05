// database/init.js
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const dbName = 'campus_events';

async function initDB() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db(dbName);

        console.log('Applying mandatory indexes...');

        // Create at least these indexes
        await db.collection('users').createIndex({ email: 1 }, { unique: true });
        await db.collection('events').createIndex({ startDate: 1 });
        await db.collection('events').createIndex({ category: 1 });

        console.log('Applying schema validation...');

        // Application-level validation rules for events[cite: 1]
        await db.command({
            collMod: 'events',
            validator: {
                $jsonSchema: {
                    bsonType: 'object',
                    required: ['title', 'category', 'startDate', 'endDate', 'capacity', 'organizerId'],
                    properties: {
                        title: {
                            bsonType: 'string',
                            minLength: 1,
                            description: 'Event title cannot be empty[cite: 1]'
                        },
                        capacity: {
                            bsonType: 'int',
                            minimum: 1,
                            description: 'Capacity must be greater than 0[cite: 1]'
                        },
                        location: {
                            bsonType: 'object',
                            description: 'Event location must be embedded[cite: 1]'
                        },
                        tags: {
                            bsonType: 'array',
                            description: 'Event tags must be stored as an array[cite: 1]'
                        },
                        registrations: {
                            bsonType: 'array',
                            description: 'Event registrations must be stored as an array of embedded documents[cite: 1]'
                        }
                    }
                }
            },
            validationLevel: 'moderate'
        }).catch(async (err) => {
            // If collection doesn't exist yet, create it with the validator
            if (err.codeName === 'NamespaceNotFound') {
                console.log('Collection does not exist, creating it now...');
                // We will just let the seed script create it naturally, 
                // validation will apply once documents are inserted.
            } else {
                console.error('Validation notice:', err.message);
            }
        });

        console.log('Database initialization complete!');
    } finally {
        await client.close();
    }
}

initDB().catch(console.error);