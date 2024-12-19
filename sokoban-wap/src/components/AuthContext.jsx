import React, {createContext, useContext, useState} from "react";
import PropTypes from "prop-types";

//create context for authentication state (isLoggedIn) and login/logout callback functions
const AuthContext = createContext();

//custom provider component - manage authentications logic (siehe main.jsx)
//wraps around child components -> they can use functions and state variable from context.
export const AuthProvider = ({children}) => {
    //state variable for authentication status
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const login = () => {
        setIsLoggedIn(true);
        localStorage.setItem("isLoggedIn", "true");
    };

    const logout = () => {
        setIsLoggedIn(false); 
        localStorage.setItem("isLoggedIn", "false");
    };

    return(
        <AuthContext.Provider value ={{ isLoggedIn, login, logout}}>
            {children}
        </AuthContext.Provider>
    )
}

AuthProvider.propTypes = {
    children: PropTypes.node,
}

//custom hook to use authentication context
export const useAuth = () => {
    return useContext(AuthContext);
}

