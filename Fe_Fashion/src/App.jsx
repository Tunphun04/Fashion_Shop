import { useState } from 'react'
import { BrowserRouter } from "react-router-dom";
import './App.css'
import './Layouts/MainLayout.jsx'
import MainLayout from './Layouts/MainLayout.jsx'
import LoginRegisterModal from "./components/auth/login_register_modal.jsx"
function App() {

 return (
    <BrowserRouter>
      <MainLayout></MainLayout>
    </BrowserRouter>
  );
}

export default App
