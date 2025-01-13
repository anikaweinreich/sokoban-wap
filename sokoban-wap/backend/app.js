import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import AuthServer from 'express-oauth-server';
import 'dotenv/config';
import AuthModel from './oAuthModel.js'; // connects the AuthServer to Database
//import path from 'path';
//import { fileURLToPath } from 'url';
import register from './register.js';
import api from './api.js';

//const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;
// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['POST', 'GET', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(express.urlencoded({ extended: false })); // in OAuth2 standard, credentials are sent as "application/x-www-form-urlencoded", this middleware allows parsing it
app.use((req, res, next) => {
    console.log(req.method, req.path);
    next();
})

try {
    const client = new MongoClient(process.env.MONGODB_CONNECTION_STRING);
    //const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    const db = client.db();

    app.set('db', db);
    //app.set('usersCollection', db.collection('users'));
    app.set('highscoresCollection', db.collection('highscores'));

    //we add TTL indexes to expiration fields to automaticolly remove expired entries
    db.collection('token').createIndex({accessTokenExpiresAt: 1}, { expireAfterSeconds: 0 });
    db.collection('token').createIndex({refreshTokenExpiresAt: 1}, { expireAfterSeconds: 0 });
    // registration token
    db.collection('token').createIndex({emailTokenExpiresAt: 1}, { expireAfterSeconds: 0 });

    // Create OAuthServer instance
    const oauth = new AuthServer({ model: AuthModel(db) }); // create oAuth middleware

    // backend routes
    app.use('/api/token', oauth.token({requireClientAuthentication: { password: false, refresh_token: false }})); // use oauth token middleware
    app.use('/api/register', register);         // handle user registration
    app.use('/api', oauth.authenticate(), api(oauth)); // use auth authentication middleware on any resource that should be protected

    // start server
    app.listen(port, () => {
        console.log(`Server running at http://localhost/:${port}`);
    });
} catch (err) {
    console.error("Error connecting to database:", err);
}





//serve static files
//app.use('/static', express.static('public')); //levels.txt zugängig unter http://localhost:3000/static/levels.txt


// Serve the React app's static files from the "dist" directory
//app.use(express.static(path.join(__dirname, "dist")));

// Fallback middleware for React Router
/*app.use((req, res) => {
  console.log("Fallback Middleware called for:", req.originalUrl);
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});*/





