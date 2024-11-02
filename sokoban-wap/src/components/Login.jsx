import {React, useState} from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";


function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    //login function from AuthContext
    const { login } = useAuth();

    const navigate = useNavigate();

    //login event handler
    const handleLogin = (e) => {
        e.preventDefault();
        if(!username || !password) {
            setError("Please fill out all fields!");
            return; 
        } 

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
        }
    };

    return(
        <>
        <h1>Login</h1>
        <form onSubmit={handleLogin}>
            <input type="text" id="username" name="username" placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <input type="password" id="password" name="password" placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="submit">Login</button>
        </form>
        {error && <p style={{color:"red"}}>{error}</p>}
        <p>{message}</p>
        <br />
        <p>Not signed up yet? Sign up here </p>
        <Link to="/signup">Signup</Link>
        </>
    );
}

export default Login;
