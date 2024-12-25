import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import App from './App.jsx'
import Login from './components/Login.jsx'
import Signup from './components/Signup.jsx'
import Game from './components/Game.jsx'
import Highscore from './components/Highscore.jsx'
import './index.css'
import NotFound from './components/NotFound.jsx'
import { AuthProvider } from './components/AuthContext.jsx'
import { useAuth } from './components/AuthContext.jsx'

//nur in Komponenten können Hooks (useAuth) verwendet werden -> daher main.jsx Logik in Komponente wrappen.
function AuthWrapper() {
  const { isLoggedIn } = useAuth();


//Routes Definition - Angabe Pfade und zugehörige Komponenten
//Navigate to (replace -> to not return to previous route from before being redirected)
const router = createBrowserRouter([
  {path: "/",
    element: <App />,
    errorElement: <NotFound />,
    children: [
      {path: "/login", element:<Login />},
      {path: "/signup", element:<Signup />},
      {path: "/game", element: isLoggedIn ? <Game /> : <Navigate to="/login" replace /> },
      {path: "/highscore", element: isLoggedIn ? <Highscore /> : <Navigate to="/login" replace /> },
    ]
  },
  /*
  {path:"/login",
    element: <Login />,
    errorElement: <NotFound />,
  },
  {path:"/signup",
    element: <Signup />,
    errorElement: <NotFound />,
  },
  {path:"/game",
    element: isLoggedIn() ? <Game /> : <Navigate to="/login" replace />,
    errorElement: <NotFound />,
  }*/
]);
//Router
return <RouterProvider router={router} />;
}

//RouterProvider rendert entsprechende Komponente bei Änderung der URL
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <AuthWrapper /> 
    </AuthProvider>
  </StrictMode>,
)
