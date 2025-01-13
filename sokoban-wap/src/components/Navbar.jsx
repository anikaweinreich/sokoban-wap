import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext'; //import custom hook to use context
import { Button } from '@mui/material';

function Navbar() {
    const {isLoggedIn, logout} = useAuth();
    const navigate = useNavigate(); 

    const handleLogout = () => {
        logout();
        navigate('/login'); // Redirect to login page after logout
    };

    return (
        <nav style={{ padding: '1rem', borderBottom: '1px solid #ddd' }}>
            <Link to="/" style={{ margin: '0 10px' }}>Home</Link>
            {isLoggedIn ? (
                <>
                    <Link to="/game" style={{ margin: '0 10px' }}>Game</Link>
                    <Link to="/highscore" style={{ margin: '0 10px' }}>High Scores</Link>
                    <span style={{ margin: '0 10px' }}>You are logged in!</span>
                    <Button 
                        onClick={handleLogout}
                        sx={{
                            margin: '0 10px',
                            padding: '6px 12px',
                            backgroundColor: '#729ABE',
                            color: '#fff',
                            fontWeight: 'bold',
                            borderRadius: '4px',
                            '&:hover': {
                                backgroundColor: '#487AA6',
                            },
                        }}
                    >
                        Logout
                    </Button>

                </>
            ) : (
                <>
                    <Link to="/login" style={{ margin: '0 10px' }}>Login</Link>
                    <Link to="/signup" style={{ margin: '0 10px' }}>Signup</Link>
                </>
            )}
        </nav>
    );
}

export default Navbar;
