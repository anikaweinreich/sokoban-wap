
import {React, useState} from "react";
//import { useNavigate } from "react-router-dom";

function Signup() {
    // State-Variablen
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // Navigation
    //const navigate = useNavigate();

    // Event-Handler für Signup
    const handleSignup = async (e) => {
        e.preventDefault();

        // Validierung: Felder dürfen nicht leer sein
        if (!username || !email) {
            setError("Please fill out all fields!");
            return;
        }

        try {
            // Anfrage an Backend
            const response = await fetch("/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username: username, email: email }),
            });

            // // Antwort vom Server überprüfen
            // const text = await response.text(); // Text lesen
            // console.log("Server response:", text); // Debugging: Rohdaten anzeigen

            // // Versuch, die Antwort zu parsen
            // const data = JSON.parse(text);

            if (!response.ok) {
                throw new Error("Signup failed");
            }

            setMessage("Signup successful. Please check your email for the activation link.");
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
            <input type="text" id="email" name="email" placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)}/>
            <button type="submit">Signup</button>
        </form>
        {error && <p style={{color:"red"}}>{error}</p>}
        <p>{message}</p>
        </>
    )
}

export default Signup;