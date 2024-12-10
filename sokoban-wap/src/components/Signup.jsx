
import {React, useState} from "react";
import { useNavigate } from "react-router-dom";

function Signup() {
    // State-Variablen
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // Navigation
    const navigate = useNavigate();

    // Event-Handler für Signup
    const handleSignup = async (e) => {
        e.preventDefault();

        // Validierung: Felder dürfen nicht leer sein
        if (!username || !password) {
            setError("Please fill out all fields!");
            return;
        }

        try {
            // Anfrage an Backend
            const response = await fetch("/api/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name: username, password: password }),
            });

            // Antwort vom Server überprüfen
            const text = await response.text(); // Text lesen
            console.log("Server response:", text); // Debugging: Rohdaten anzeigen

            // Versuch, die Antwort zu parsen
            const data = JSON.parse(text);

            if (!response.ok) {
                // Wenn ein Fehler auftritt, wird eine Exception geworfen
                throw new Error(data.error || "Signup failed");
            }

            // Erfolg: Weiterleitung zur Login-Seite
            setMessage("Signup successful. Redirecting to login page...");
            setTimeout(() => navigate("/login"), 2000);
        } catch (err) {
            // Fehler behandeln
            console.error("Signup error:", err);
            setError(err.message || "An unexpected error occurred.");
        }
    };

    //JSX 
    //display error message, if not all fields are filled out (error is not null)
    return(
        <>
        <h1>Signup</h1>
        <form onSubmit={handleSignup}>
            <input type="text" id="username" name="username" placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)}/>
            <input type="password" id="password" name="password" placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)}/>
            <button type="submit">Signup</button>
        </form>
        {error && <p style={{color:"red"}}>{error}</p>}
        <p>{message}</p>
        </>
    )
}

export default Signup;
