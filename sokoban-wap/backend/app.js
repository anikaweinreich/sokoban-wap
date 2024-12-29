import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import OAuthServer from "express-oauth-server";
import 'dotenv/config';
import createApiRoutes from './api.js';
import oAuthModel from './oAuthModel.js';
import path from 'path';
import { fileURLToPath } from 'url';
import register from './register.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
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


//serve static files
//app.use('/static', express.static('public')); //levels.txt zugängig unter http://localhost:3000/static/levels.txt


// Serve the React app's static files from the "dist" directory
app.use(express.static(path.join(__dirname, "dist")));

// Fallback middleware for React Router
app.use((req, res) => {
  console.log("Fallback Middleware called for:", req.originalUrl);
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});





