import express from 'express';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

const register = express.Router();

// Route für die Registrierung
register.post('/', async (req, res) => {
  console.log('Received Signup Request:', req.body);

  try {
    const usersCollection = req.app.get('usersCollection');
    const { name, password, oauthProvider, oauthToken } = req.body;
    const db = req.app.get('db');

    // Fall 1: OAuth-Basierte Registrierung
    if (oauthProvider && oauthToken) {
      console.log(`Processing OAuth Signup with ${oauthProvider}`);
      
      // Überprüfen, ob der Benutzer bereits existiert
      const existingUser = await usersCollection.findOne({ name });
      if (existingUser) {
        return res.status(409).json({ error: 'User already exists' });
      }

      // Benutzer direkt ohne Passwort speichern (OAuth-Token wird nicht gespeichert)
      const oauthUserInsertion = await usersCollection.insertOne({
        name,
        oauthProvider,
        isActive: true, // OAuth-Benutzer sind direkt aktiv
        createdAt: new Date(),
      });

      if (!oauthUserInsertion.acknowledged) {
        return res.status(500).json({ error: 'Failed to create user via OAuth.' });
      }

      return res.status(201).json({ message: 'OAuth Signup successful.' });
    }

    // Fall 2: Standardregistrierung mit Name und Passwort
    if (!name || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    // Überprüfen, ob der Benutzer bereits existiert
    const existingUser = await usersCollection.findOne({ name });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Passwort verschlüsseln
    const hashedPassword = await bcrypt.hash(password, 10);

    // Benutzer in der 'users' Collection speichern
    const userInsertion = await usersCollection.insertOne({
      name,
      password: hashedPassword,
      isActive: false, // Standardmäßig nicht aktiv
      createdAt: new Date(),
    });

    if (!userInsertion.acknowledged) {
      return res.status(500).json({ error: 'Failed to create user.' });
    }

    // Aktivierungs-Token erstellen
    const emailToken = uuidv4();
    const tokenInsertion = await db.collection('tokens').insertOne({
      emailToken,
      emailTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000), // Token läuft in 1 Stunde ab
      user_id: userInsertion.insertedId, // Verweis auf den Benutzer
    });

    if (!tokenInsertion.acknowledged) {
      // Token-Fehler, Benutzer löschen
      await usersCollection.deleteOne({ _id: userInsertion.insertedId });
      return res.status(500).json({ error: 'Failed to generate activation token.' });
    }

    // Aktivierungslink (zum Testen in der Konsole ausgeben)
    console.log(`Activation link: http://localhost:3000/activate/${emailToken}`);

    res.status(201).json({
      message: 'User registered successfully. Please activate your account.',
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
    const userUpdate = await usersCollection.updateOne(
      { _id: token.user_id },
      { $set: { isActive: true } }
    );

    if (userUpdate.modifiedCount === 0) {
      return res.status(500).json({ error: 'Failed to activate user.' });
    }

    // Token löschen
    await db.collection('tokens').deleteOne({ emailToken: req.params.token });

    res.status(200).json({ message: 'User activated successfully.' });
  } catch (err) {
    console.error('Error during activation:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default register;
