import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import App from './App.jsx'
import Login from './components/Login.jsx'
import Signup from './components/Signup.jsx'
import Game from './components/Game.jsx'
import './index.css'
import NotFound from './components/NotFound.jsx'
import { AuthProvider } from './components/AuthContext.jsx'

const isLoggedIn = () => localStorage.getItem('isLoggedIn') === "true";

//Routes Definition - Angabe Pfade und zugehörige Komponenten
//Navigate to (replace -> to not return to previous route from before being redirected)
const router = createBrowserRouter([
  {path: "/",
    element: <App />,
    errorElement: <NotFound />,
    children: [
      {path: "/login", element:<Login />},
      {path: "/signup", element:<Signup />},
      { path: "/game", element: isLoggedIn() ? <Game /> : <Navigate to="/login" replace /> },
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

//RouterProvider rendert entsprechende Komponente bei Änderung der URL
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
)
