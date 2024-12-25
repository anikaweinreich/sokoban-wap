
import './App.css'
import Navbar from './components/Navbar'
import { Outlet } from 'react-router-dom'
import React from 'react'

function App() {

  return (
    <>
        <Navbar />
        <Outlet />
    </>
  )
}

export default App
