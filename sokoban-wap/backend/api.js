import express from 'express';
import { ObjectId } from 'mongodb';

const router = express.Router();

// User Routes
router.get('/user', async (req, res) => {
  try {
    const usersCollection = req.app.get('usersCollection'); // Verwendet die Collection aus app.js
    const users = await usersCollection.find({}).toArray();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});

router.get('/user/:id', async (req, res) => {
  try {
    const usersCollection = req.app.get('usersCollection');
    const user = await usersCollection.findOne({ _id: new ObjectId(req.params.id) });

    if (user) {
      res.json(user);
    } else {
      res.status(404).send();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});

router.post('/user', async (req, res) => {
  try {
    const usersCollection = req.app.get('usersCollection');
    const insertion = await usersCollection.insertOne(req.body);

    if (insertion.acknowledged) {
      const user = await usersCollection.findOne({ _id: insertion.insertedId });

      if (user) {
        res.status(201).json(user);
      } else {
        res.status(404).send();
      }
    } else {
      res.status(500).send();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});

router.put('/user/:id', async (req, res) => {
  try {
    const usersCollection = req.app.get('usersCollection');
    const updateData = req.body;
    delete updateData._id;

    const updated = await usersCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    );

    if (updated.modifiedCount === 1) {
      const updatedUser = await usersCollection.findOne({ _id: new ObjectId(req.params.id) });

      if (updatedUser) {
        res.json(updatedUser);
      } else {
        res.status(404).send();
      }
    } else {
      res.status(404).send();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});

router.delete('/user/:id', async (req, res) => {
  try {
    const usersCollection = req.app.get('usersCollection');
    const deleted = await usersCollection.deleteOne({ _id: new ObjectId(req.params.id) });

    if (deleted.deletedCount === 1) {
      res.send();
    } else {
      res.status(404).send();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});

// Login Route
router.post('/login', async (req, res) => {
  try {
    const usersCollection = req.app.get('usersCollection');
    const { name, password } = req.body;

    if (!name || !password) {
      return res.status(400).json({ error: 'Name and password are required' });
    }

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

// Signup Route
router.post('/signup', async (req, res) => {
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
    const newUser = { name, password };
    await usersCollection.insertOne(newUser);
    return res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).send();
  }
});

// Highscore Routes
router.get('/highscore', async (req, res) => {
  try {
    const highscoresCollection = req.app.get('highscoresCollection');
    const highscores = await highscoresCollection.find().sort({ score: -1 }).toArray();
    res.status(200).json(highscores);
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});

router.post('/highscore/add', async (req, res) => {
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

export default router;
