// Register User
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const db = req.app.get('db');

        // Insert user credentials from signup into the user_auth collection (username, email)
        const insertion = await db.collection('user_auth').insertOne({
            username: req.body.username,
            email: req.body.email,
        });

        if (insertion.acknowledged) {
            // generate token
            const token = uuidv4();

            // Insert registration token (emailToken) into the token collection in the database with a 60-minute expiration
            const tokenInsertion = await db.collection('token').insertOne({
                emailToken: token,
                emailTokenExpiresAt: new Date(Date.now() + (1000 * 60 * 60)),
                user_id: insertion.insertedId,
            });

            // activation link in console
            if (tokenInsertion.acknowledged) {
                console.log(`Activation link: http://localhost:5173/activate/${token}`);
                res.status(200).send();
            } else {
                res.status(500).send();
            }
        } else {
            res.status(500).send();
        }
    } catch (err) {
        console.error(err);
        res.status(500).send();
    }
});

// Activate User
// token als URL Parameter erhalten
router.put('/:token', async (req, res) => {
    try {
        const db = req.app.get('db');

        // registration token (emailToken) in Datenbank finden
        const token = await db.collection('token').findOne({ emailToken: req.params.token });

        console.log('Activating ....');
        console.log(req.body.firstName);
        console.log(req.body.lastName);
        console.log(token)
        if (token) {
            // Insert user details into the user collection if registration token is found in database
            const insertion = await db.collection('user').insertOne({
                first_name: req.body.firstName,
                last_name: req.body.lastName,
                permissions: { write: true },
            });

            // if insertion of user is successful
            if (insertion.acknowledged) {
                // Update the user_auth collection with password and link to user
                const updatedAuth = await db.collection('user_auth').updateOne(
                    { _id: token.user_id },
                    { $set: { password: await bcrypt.hash(req.body.password, 10), user_id: insertion.insertedId } }
                );

            
                if (updatedAuth.modifiedCount > 0) {
                    // Delete the used token
                    await db.collection('token').deleteOne({ emailToken: req.params.token });
                    res.status(200).send();
                } else {
                    res.status(500).send();
                }
            } else {
                res.status(500).send();
            }
        } else {
            res.status(401).send();
        }
    } catch (err) {
        console.error(err);
        res.status(500).send();
    }
});

export default router;