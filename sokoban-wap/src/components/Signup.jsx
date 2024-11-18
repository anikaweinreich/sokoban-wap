
import {React, useState} from "react";
import { useNavigate } from "react-router-dom";

function Signup() {
    //state variables
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    //navigate function
    const navigate = useNavigate(); 

    //prevent default form submission behavior
    const handleSignup = async (e) => {
        e.preventDefault(); 
        //check if all fields are filled out
        if(!username || !password) {
            setError("Please fill out all fields!");
            return;
        }

        /* localstorage: 
        //create json array in localstorage for users if it does not exist already (if users is null). Get users array if exists (not null).
        //string from localstorage with JSON.parse to JSON object/array
        const users = JSON.parse(localStorage.getItem("users")) || [];
        //see if username exists in localstorage already
        const userExists = users.some(user => user.username === username);

        if(userExists) {
            setMessage("User already exists. Please log in or try another username.");
        } else {
            //add username and password to users array in localstorage
            users.push({username, password});
            localStorage.setItem("users", JSON.stringify(users));
            setMessage("Signup successful. Redirecting to login page...");
            //navigate to login page after timeout/delay of 2 seconds
            setTimeout(() => navigate("/login"), 2000);
        }*/

            try {
                const response = await fetch('http://localhost:3000/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({"name": username, "password": password})
                });
    
                const data = await response.json();
    
                if(!response.ok) {
                    //wenn man error Objekt zurückbekommt wird es ausgegeben, sonst 'Signup failed'
                    throw new Error(data.error || 'Signup failed')
                }
    
                setMessage("Signup successful. Redirecting to login page...");
                //navigate to login page after timeout/delay of 2 seconds
                setTimeout(() => navigate("/login"), 2000);
                
            } catch (e) {
                setMessage("User already exists. Please log in or try another username.");
            } 

        setError("");
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
