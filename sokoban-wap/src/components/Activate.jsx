
import {React, useState} from "react";
import { useNavigate, useParams } from "react-router-dom";

import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';

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
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 4, width: '100%', maxWidth: 360, textAlign: 'center', boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)' }}>
                <Typography variant="h4" sx={{ color: '#729ABE', fontWeight: 700, mb: 2 }}>Activate User</Typography>
                <form onSubmit={handleActivation} noValidate>
                    <TextField 
                        fullWidth 
                        label="First Name" 
                        variant="outlined" 
                        margin="normal" 
                        value={firstName} 
                        onChange={(e) => setFirstName(e.target.value)} 
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} 
                    />
                    <TextField 
                        fullWidth 
                        label="Last Name" 
                        variant="outlined" 
                        margin="normal" 
                        value={lastName} 
                        onChange={(e) => setLastName(e.target.value)} 
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} 
                    />
                    <TextField 
                        fullWidth 
                        label="Password" 
                        type="password" 
                        variant="outlined" 
                        margin="normal" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} 
                    />
                    <Button 
                        type="submit" 
                        variant="contained" 
                        fullWidth 
                        sx={{ mt: 3, borderRadius: '15px', fontWeight: 'bold', bgcolor: '#729ABE', ':hover': { bgcolor: '#487AA6' } }}>
                        Activate
                    </Button>
                </form>
                {error && <Typography variant="body2" color="error" sx={{ mt: 2 }}>{error}</Typography>}
                {message && <Typography variant="body2" sx={{ mt: 2, color: '#4caf50' }}>{message}</Typography>}
            </Paper>
        </Box>
    );
    
}

export default Activate;