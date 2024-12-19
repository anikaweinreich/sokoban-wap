import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import OAuthServer from "express-oauth-server";
import 'dotenv/config';
import createApiRoutes from './api.js';
import oAuthModel from './oAuthModel.js';
import path from 'path';
import { fileURLToPath } from 'url';


const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['POST', 'GET', 'PUT', 'DELETE'],
  credentials: true,
}));

(async () => {
  try {
    const client = new MongoClient(process.env.MONGODB_CONNECTION_STRING);
    await client.connect();
    const db = client.db();

    app.set('db', db);
    app.set('usersCollection', db.collection('users'));
    app.set('highscoresCollection', db.collection('highscores'));

    // Create OAuthServer instance
    const oauth = new OAuthServer({
      model: oAuthModel(db),
    });

    // OAuth token endpoint
    app.post('/api/token', oauth.token({
      requireClientAuthentication: { password: false, refresh_token: false },
    }));

    // Protected API routes
    app.use('/api', createApiRoutes(oauth));

    // Start server
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Error connecting to database:", err);
  }
})();


//route definitions
/*
app.get('/', (req, res) => {
    res.send('Hello World')
});
//login route  
app.post('/login', async (req, res) => {
    try {
        const usersCollection = req.app.get('usersCollection');
        const { name, password } = req.body;

        // Validierung
        if (!name || !password) {
            return res.status(400).json({ error: 'Name and password are required' });
        }

        // Datenbankabfrage
        const user = await usersCollection.findOne({ name, password });

        if (user) {
            res.status(200).json({ message: 'Login successful' });
        } else {
            res.status(401).json({ error: 'Invalid username or password' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send();
    }
});

// signup route
/*app.post('/signup', async (req, res) => {
    const { name, password } = req.body;
    // prüfen ob alle Felder mitgeschickt wurden
    if (!name || !password) {
        return res.status(400).json({ error: 'Name and password are required' });
    }

    // Zugriff auf usersCollection aus der App
    const usersCollection = req.app.get('usersCollection');

    // prüfen, ob der User bereits existiert
    const existingUser = await usersCollection.findOne({ name });

    if (existingUser) {
        return res.status(409).json({ error: 'User already exists' });
    }

    // neuen User zur Datenbank hinzufügen
    try {
        const newUser = { name, password };
        await usersCollection.insertOne(newUser);
        return res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).send();
    }
});
*/
/*
//highscore routes (Authorization required -> use middleware)
//get highscore from database
app.get('/highscore', mockAuthorization, async (req, res) => {
    try {
        const highscoresCollection = req.app.get('highscoresCollection'); 

        const highscores = await highscoresCollection.find().sort({ score: -1 }).toArray();
        res.status(200).json(highscores);
    } catch (err) {
        console.error(err);
        res.status(500).send();
    }
});
//add highscore to database
app.post('/highscore/add', mockAuthorization, async (req, res) => {
    const { name, score } = req.body;

    // Validierung
    if (!name || score === undefined) {
        return res.status(400).json({ error: 'Username and score are required' });
    }

    try {
        const highscoresCollection = req.app.get('highscoresCollection');

        // Highscore einfügen
        const result = await highscoresCollection.insertOne({ name, score });

        if (result.acknowledged) {
            res.status(201).json({ message: 'Highscore added successfully' });
        } else {
            res.status(500).json({ error: 'Failed to add highscore' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send();
    }
});

*/
//serve static files
//app.use('/static', express.static('public')); //levels.txt zugängig unter http://localhost:3000/static/levels.txt

// Define __dirname for ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Serve the React app's static files from the "dist" directory
app.use(express.static(path.join(__dirname, "dist")));

// Fallback middleware for React Router
/*app.use((req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});*/





