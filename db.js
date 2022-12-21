const MongoClient = require('mongodb').MongoClient;

// Replace with your own MongoDB connection string
const mongoUrl = 'mongodb://localhost:27017';

// Connect to the MongoDB database and create the collections if they don't exist
MongoClient.connect(mongoUrl, (err, client) => {
    if (err) {
        console.error(err);
        return;
    }
    const db = client.db('nutrition');
    console.log('Connected to MongoDB');

    // Create the "nutrition_plans" collection if it doesn't exist
    db.createCollection('nutrition_plans', (err, res) => {
        if (err) {
            console.error(err);
        } else {
            console.log('Created "nutrition_plans" collection');
        }
    });
});