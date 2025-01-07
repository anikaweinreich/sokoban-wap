import express from 'express';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

const register = express.Router();

// Route für die Registrierung
register.post('/', async (req, res) => {
  console.log('Received Signup Request:', req.body);

  try {
    const usersCollection = req.app.get('usersCollection');
    const { name, password } = req.body;
    const db = req.app.get('db');

    // Input-Validierung
    if (!password || !name) {
      return res.status(400).json({ error: 'Username, and password are required.' });
    }

    const existingUser = await usersCollection.findOne({ name });
  
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }
  

    // Passwort verschlüsseln
    const hashedPassword = await bcrypt.hash(password, 10);

    // Benutzer in der 'user_auth' Collection speichern (nur für Authentifizierung)
    const userAuthInsertion = await db.collection('user_auth').insertOne({
      password: hashedPassword,
      isActive: false,
    });
    
    const userInsertion = await usersCollection.insertOne({
      user_id: userAuthInsertion.insertedId,  // Verwende die erzeugte ID korrekt
      name,
      isActive: false,
      createdAt: new Date(),
    });
    

    if (!userAuthInsertion.acknowledged) {
      return res.status(500).json({ error: 'Failed to create user in user_auth.' });
    }

    if (!userInsertion.acknowledged) {
      return res.status(500).json({ error: 'Failed to create user in users.' });
    }

    // Aktivierungs-Token erstellen
    const emailToken = uuidv4();
    const tokenInsertion = await db.collection('tokens').insertOne({
      emailToken,
      emailTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000),  // Token läuft in 1 Stunde ab
      user_id: userAuthInsertion.insertedId,  // Verweis auf die user_auth Collection
    });

    if (!tokenInsertion.acknowledged) {
      // Token-Fehler, also Benutzer in user_auth und users löschen
      await db.collection('user_auth').deleteOne({ _id: userAuthInsertion.insertedId });
      await usersCollection.deleteOne({ user_id: userAuthInsertion.insertedId });
      return res.status(500).json({ error: 'Failed to generate activation token.' });
    }

    // Aktivierungslink (für den Test in der Konsole ausgeben)
    console.log(`Activation link: http://localhost:3000/activate/${emailToken}`);

    res.status(201).json({
      message: 'User registered successfully. Please activate your account.',
      userId: userAuthInsertion.insertedId,
    });
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Route zur Aktivierung des Benutzers
register.put('/activate/:token', async (req, res) => {
  try {
    const usersCollection = req.app.get('usersCollection');
    const db = req.app.get('db');
    const token = await db.collection('tokens').findOne({ emailToken: req.params.token });

    if (!token) {
      return res.status(400).json({ error: 'Invalid or expired activation token.' });
    }

    if (token.emailTokenExpiresAt < new Date()) {
      await db.collection('tokens').deleteOne({ emailToken: req.params.token });
      return res.status(400).json({ error: 'Activation token has expired.' });
    }

    // Benutzer aktivieren
    const userUpdate = await db.collection('user_auth').updateOne(
      { _id: token.user_id },
      { $set: { isActive: true } }
    );

    if (userUpdate.modifiedCount === 0) {
      return res.status(500).json({ error: 'Failed to activate user.' });
    }

    // Benutzer in der 'users' Collection aktualisieren
    await usersCollection.updateOne(
      { user_id: token.user_id },
      { $set: { isActive: true } }
    );

    // Token löschen
    await db.collection('tokens').deleteOne({ emailToken: req.params.token });

    res.status(200).json({ message: 'User activated successfully.' });
  } catch (err) {
    console.error('Error during activation:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default register;
