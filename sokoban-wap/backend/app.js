import express from "express";
import cors from "cors";

const app = express(); 

//middleware zur Ürpfung, on JSON im request Objekt gesendet wird
app.use(express.json()); 
// Use CORS middleware
app.use(cors({
    origin: 'http://localhost:5173', // Frontend origin
    methods: 'POST,GET,PUT,DELETE',   // Allowed HTTP methods
    credentials: true,                // Allow cookies if needed
}));

//backend port
const port = 3000;

//Arrays für Mockup Routen (stellen Datenbank dar)
let users = [];
let highscores = [];

//route definitions

app.get('/', (req, res) => {
    res.send('Hello World')
});
//login route 
app.post('/login', (req, res) => {
    const name = req.body.name;
    const password = req.body.password;

    //prüfen on alle Felder mitgeschickt wurden
    if(!name || !password) {
        return res.status(400).json({error: 'Name and password are required'});
    }
    //User im Array (später Datenbank) suchen
    const user = users.find(u => u.name === name && u.password === password);

    if(user) {
        return res.status(200).json({message: 'Login successful'});
    } else {
        return res.status(401).json({error: 'Invalid usename or password'});
    }
});
//signup route
app.post('/signup', (req, res) => {
    const {name, password} = req.body;
    //prüfen on alle Felder mitgeschickt wurden
    if(!name || !password) {
        return res.status(400).json({error: 'Name and password are required'});
    }

    //prüfen, ob user bereits existiert
    if(users.some(u => u.name === name)) {
        return res.status(409).json({error: 'user already exists'});
    }

    //neuen User zur Datenbank hinzufügen, wenn er noch nicht existiert
    users.push({name, password});
    return res.status(201).json({message: 'user created successfully'});
});
//highscore routes
//get highscore from database
app.get('/highscore', (req, res) => {
    //highscores sortieren
    const sortedHighscores = [...highscores].sort((a,b) => b.score - a.score);
    res.status(200).json(sortedHighscores); 
});
//add highscore to database
app.post('/highscore/add', (req, res) => {
    //username und highscore aus dem Request body nehmen
    const {name, score} = req.body;

    //validate
    if(!name || score === undefined) {
        return res.status(201).json({error: 'username and score required'});
    }
    //add highscore - hier nachher in Datenbank schreiben
    highscores.push({name, score});
    return res.status(201).json({message: 'highscore added successfully'});

})

//start server
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});





