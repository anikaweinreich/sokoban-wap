import { React, useState } from "react";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
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

    // Function to clear error message on user input
    const handleInputChange = (setter, field) => (e) => {
        if (error) setError(""); 
        setter(e.target.value);
    };

    // JSX 
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 4, width: '100%', maxWidth: 360, textAlign: 'center', boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)' }}>
                <Typography variant="h4" sx={{ color: '#729ABE', fontWeight: 700, mb: 2 }}>Signup</Typography>
                <form onSubmit={handleSignup} noValidate>
                    <TextField 
                        fullWidth 
                        label="Username" 
                        variant="outlined" 
                        margin="normal" 
                        value={username} 
                        onChange={handleInputChange(setUsername)} // Use the handleInputChange
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} 
                    />
                    <TextField 
                        fullWidth 
                        label="Email" 
                        variant="outlined" 
                        margin="normal" 
                        value={email} 
                        onChange={handleInputChange(setEmail)} // Use the handleInputChange
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} 
                    />
                    <Button 
                        type="submit" 
                        variant="contained" 
                        fullWidth 
                        sx={{ mt: 3, borderRadius: '15px', fontWeight: 'bold', bgcolor: '#729ABE', ':focus': {outline: 'none'}, ':hover': { bgcolor: '#487AA6' } }}>
                        Signup
                    </Button>
                </form>
                {error && <Typography variant="body1" color="error" sx={{ mt: 2 }}>{error}</Typography>}
                {message && <Typography variant="body1" sx={{ mt: 2, color: '#4caf50' }}>{message}</Typography>}
            </Paper>
        </Box>
    );
}

export default Signup;
