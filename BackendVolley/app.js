const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5500;

app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.DB_URL);
let database;
let teams;
let matches;

async function startServer() {
  try {
    await client.connect();
    database = client.db(process.env.DB_NAME || 'VolleyTrack');
    teams = database.collection('teams');
    matches = database.collection('matches');
    console.log("Connected to MongoDB:", process.env.DB_NAME);

    app.listen(port, "0.0.0.0", () => {
      console.log(`VolleyTrack backend running on port ${port}`);
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
    res.json(allTeams);
  } catch (err) {
    console.error("GET /teams error:", err);
    res.status(500).json({ message: 'Database error' });
  }
});

app.post('/teams/:teamId/players', async (req, res) => {
  try {
    const { teamId } = req.params;
    const { number, position, isPlaying } = req.body;

    if (!number || !position) {
      return res.status(400).json({ message: 'Speler nummer en positie verplicht' });
    }

    const player = { number, position, isPlaying: !!isPlaying, stats: {} };

    const result = await teams.updateOne(
      { _id: new ObjectId(teamId) },
      { $push: { players: player } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: 'Team niet gevonden' });
    }

    res.json({ message: 'Speler toegevoegd', player });

  } catch (err) {
    console.error("POST /players error:", err);
    res.status(500).json({ message: 'Database error' });
  }
});

app.get('/teams/:teamId/players', async (req, res) => {
  try {
    const { teamId } = req.params;
    const team = await teams.findOne({ _id: new ObjectId(teamId) });

    if (!team) return res.status(404).json({ message: 'Team niet gevonden' });

    res.json(Array.isArray(team.players) ? team.players : []);

  } catch (err) {
    console.error("GET /players error:", err);
    res.status(500).json({ message: 'Database error' });
  }
});

app.post('/matches', async (req, res) => {
  try {
    const {
      teamId,
      teamName,
      players,
      opponentZones,
      ballDrops
    } = req.body;

    if (!teamId || !players) {
      return res.status(400).json({ message: 'Ongeldige match data' });
    }

    const match = {
      teamId: new ObjectId(teamId),
      teamName,
      players,
      opponentZones,
      ballDrops,
      createdAt: new Date()
    };

    const result = await matches.insertOne(match);
    res.json({ message: 'Match opgeslagen', matchId: result.insertedId });

  } catch (err) {
    console.error('POST /matches error:', err);
    res.status(500).json({ message: 'Database error' });
  }
});

