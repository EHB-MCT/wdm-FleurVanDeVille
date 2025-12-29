const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5500;

app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.DB_URL);
let database;
let teams;

async function startServer() {
  try {
    await client.connect();
    database = client.db(process.env.DB_NAME);
    teams = database.collection('teams');
    console.log("Connected to MongoDB:", process.env.DB_NAME);

    app.listen(process.env.PORT, () => {
      console.log(`VolleyTrack backend running on port ${process.env.PORT}`);
    });
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
  }
}
startServer();

app.post('/teams', async (req, res) => {
  try {
    if (!teams) return res.status(503).json({ message: 'Database not ready' });

    const { coachName, teamName } = req.body;
    if (!coachName || !teamName) {
      return res.status(400).json({ message: 'Coachnaam en teamnaam verplicht' });
    }

    const team = {
      coachName,
      teamName,
      players: [],
      createdAt: new Date()
    };

    const result = await teams.insertOne(team);
    console.log(`Team created: ${teamName} by coach ${coachName}`);
    res.json({ _id: result.insertedId, coachName, teamName });

  } catch (err) {
    console.error("POST /teams error:", err);
    res.status(500).json({ message: 'Database error' });
  }
});

app.get('/teams', async (req, res) => {
  try {
    if (!teams) return res.status(503).json({ message: 'Database not ready' });

    const allTeams = await teams.find({}).toArray();
    console.log(`Fetched ${allTeams.length} teams`);
    res.json(allTeams);

  } catch (err) {
    console.error("GET /teams error:", err);
    res.status(500).json({ message: 'Database error' });
  }
});
