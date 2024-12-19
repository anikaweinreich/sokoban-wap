import express from 'express';
import bcrypt from 'bcrypt';

const register = express.Router();

// Register new user
register.post('/', async (req, res) => {
  const { username, password } = req.body;
  
  // Hash password before saving with bcrypt library
  const hashedPassword = await bcrypt.hash(password, 10);

  // Store user data
  const result = await req.app.get('db').collection('user_auth').insertOne({
    username,
    password: hashedPassword,
  });

  res.json({ message: 'User registered successfully', userId: result.insertedId });
});

export default register;
