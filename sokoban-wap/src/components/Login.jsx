import {React, useState} from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";

import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';


function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    //const [message] = useState("");
    const [error, setError] = useState("");

    //login function from AuthContext
    const { login } = useAuth();

    const navigate = useNavigate();

    //login event handler
    const handleLogin = async (e) => {
        e.preventDefault();
        if(!username || !password) {
            setError("Please fill out all fields!");
            return; 
        } 

        /* local storage
        const users = JSON.parse(localStorage.getItem("users")) || [];
        //check if username and password are correct
        const user = users.find(u => u.username === username && u.password === password);
        
        if(user) {
            login();
            //navigate to game component
            navigate("/game");
        } else {
            setMessage("Incorrect username or password.");
            setError("");
        }*/

        try {
            const response = await fetch("/api/token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    username,
                    password,
                    grant_type: "password",
                    client_id: "sokoban",
                }).toString(),
            });

            if(!response.ok) {
                //wenn man error Objekt zurückbekommt wird es ausgegeben, sonst 'Login failed'
                throw new Error("Invalid username or password");
            }

            const data = await response.json();

            
            // Save tokens to local storage
            localStorage.setItem("accessToken", data.access_token);
            localStorage.setItem("refreshToken", data.refresh_token);
            
            // Save the username to localStorage
            localStorage.setItem("username", username);

            login();
            //navigate to game component
            navigate("/game");
            
        } catch (e) {
            console.error(e);
            setError(e.message || "An error occurred. Please try again.");
        }     
    };

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 4, width: '100%', maxWidth: 360, textAlign: 'center', boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)' }}>
                <Typography variant="h4" sx={{ color: '#77AB82', fontWeight: 700, mb: 2 }}>Login</Typography>
                <form onSubmit={handleLogin} noValidate>
                    <TextField 
                        fullWidth 
                        label="Username" 
                        variant="outlined" 
                        margin="normal" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} 
                    />
                    <TextField 
                        fullWidth 
                        label="Password" 
                        variant="outlined" 
                        type="password" 
                        margin="normal" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} 
                    />
                    <Button 
                        type="submit" 
                        variant="contained" 
                        fullWidth 
                        sx={{ mt: 3, borderRadius: '15px', fontWeight: 'bold', bgcolor: '#77AB82', ':focus': {outline: 'none'}, ':hover': { bgcolor: '#589B66' } }}>
                        Login
                    </Button>
                </form>
                {error && <Typography variant="body2" color="error" sx={{ mt: 2 }}>{error}</Typography>}
                <Typography variant="body1" sx={{ mt: 3 }}>
                    Not signed up yet?{' '}
                    <Link to="/signup" style={{ color: '#729ABE', textDecoration: 'none', fontWeight: 'bold' }}>
                        Signup
                    </Link>
                </Typography>
            </Paper>
        </Box>
    );
    
}

export default Login;
