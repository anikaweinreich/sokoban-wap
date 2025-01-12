import express from 'express';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';
import register from './register.js';  // Importiere die Register-Logik

async function writeAccess(req, res, next) {
  const db = req.app.get('db');

  // Retrieve user information based on token
  const token = await db.collection('token').findOne({ accessToken: req.headers.authorization });
  if (token) {
      const user = await db.collection('user_auth').findOne({ _id: ObjectId(token.user_id) });
      if (user && user.permissions.write) {
          res.locals.user = user; // Attach user to res.locals
          return next();
      } else {
          res.status(403).send();
      }
  }
}


const createApiRoutes = (oauth) => {
  const router = express.Router();
// User Routes -> protected with OAuth middleware

/*router.use('/signup', register);
router.get('/user', oauth.authenticate(), async (req, res) => {
  try {
    const usersCollection = req.app.get('usersCollection'); // Verwendet die Collection aus app.js
    const users = await usersCollection.find({}).toArray();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});


//Login Route

router.post('/login', async (req, res) => {
  try {
    const usersCollection = req.app.get('usersCollection');
    const { name, password } = req.body;

    if (!name || !password) {
      return res.status(400).json({ error: 'Name and password are required' });
    }

    const user = await usersCollection.findOne({ name });

    if (user && await bcrypt.compare(password, user.password)) {
      res.status(200).json({ message: 'Login successful' });
    } else {
      res.status(401).json({ error: 'Invalid username or password' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});


// Signup Route
/*router.post('/signup', async (req, res) => {
  const { name, password } = req.body;

  if (!name || !password) {
    return res.status(400).json({ error: 'Name and password are required' });
  }

  const usersCollection = req.app.get('usersCollection');

  const existingUser = await usersCollection.findOne({ name });

  if (existingUser) {
    return res.status(409).json({ error: 'User already exists' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await usersCollection.insertOne({ name, password: hashedPassword });
    return res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).send();
  }
});*/

//router.use('/signup', register); 

// Highscore Routes
router.get('/highscore', /*oauth.authenticate(),*/ async (req, res) => {
  //console.log('Authenticated token:', res.locals.oauth.token); // Debugging
  try {
      const highscoresCollection = req.app.get('highscoresCollection');
      const highscores = await highscoresCollection.find().sort({ score: -1 }).toArray();
      res.status(200).json(highscores);
  } catch (err) {
      console.error(err);
      res.status(500).send();
  }
});

router.post('/highscore/add',  /*writeAccess, oauth.authenticate(),*/ async (req, res) => {
  const { name, score } = req.body;

  if (!name || score === undefined) {
    return res.status(400).json({ error: 'Username and score are required' });
  }

  try {
    const highscoresCollection = req.app.get('highscoresCollection');
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

// Test Route
router.get('/', (req, res) => {
  res.send('API is working!');
});

  return router;
};

export default createApiRoutes;