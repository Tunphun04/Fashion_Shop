import { useState } from 'react'
import './App.css'
import './Layouts/MainLayout.jsx'
import MainLayout from './Layouts/MainLayout.jsx'
import { AuthModalProvider } from "./context/AuthModalContext.jsx";
import LoginRegisterModal from "./components/auth/login_register_modal.jsx"
function App() {

 return (
    <AuthModalProvider>
      <MainLayout />
      <LoginRegisterModal />
    </AuthModalProvider>
  );
}

export default App
