import { red } from "@mui/material/colors";
import React from "react";
import { Link } from "react-router-dom";

function NotFound() {
    //return JSX with 404 not found error message
    return (
        <div style={{color: "#ef9a9a", textAlign: "center", marginTop:"70px"}}>
            <h1>404 - PAGE NOT FOUND</h1>
            <p> The page you are looking for does not exist. Try another path, maybe you will find enlightenment elsewhere.</p>
            <Link to="/">Go back home</Link>
        </div>
    );
}

export default NotFound; 