
import {React, useState} from "react";
import { useNavigate, useParams } from "react-router-dom";

function Activate() {
    // State-Variablen
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // Extract email token from the URL
    const { token: emailToken } = useParams();

    // Navigation
    const navigate = useNavigate();

    // Event-Handler für Signup
    const handleActivation = async (e) => {
        e.preventDefault();

        // Validierung: Felder dürfen nicht leer sein
        if (!firstName || !lastName || !emailToken) {
            setError("Please fill out all fields!");
            return;
        }

        try {
            // Anfrage an Backend
            const response = await fetch(`/api/register/${emailToken}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ firstName: firstName, lastName: lastName, password: password }),
            });

            if (!response.ok) {
                throw new Error("Activation failed");
            }

            // Erfolg: Weiterleitung zur Login-Seite
            setMessage("Activation successful. Redirecting to login page...");
            setTimeout(() => navigate("/login"), 2000);
        } catch (err) {
            // Fehler behandeln
            console.error("Activation error:", err);
            setError(err.message || "An unexpected error occurred.");
        }
    };

    //JSX 
    return(
        <>
        <h1>Activate User</h1>
            <form onSubmit={handleActivation}>
                <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                />
                <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                />
                <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Activate</button>
            </form>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <p>{message}</p>
        </>
    )
}

export default Activate;