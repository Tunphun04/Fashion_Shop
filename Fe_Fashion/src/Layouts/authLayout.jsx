// src/components/Layouts/Auth-Layout.jsx
import { Routes, Route } from 'react-router-dom';
import Signup from '../pages/auth/signup';
import Login from '../pages/auth/login';
import '../../public/css/Auth-Layout.css';

export default function AuthForm() {
  return (   
      <Routes>
        <Route path='/login' element={<Login />} />    
        <Route path='/' element={<Login />} />       {/* Trang chính là Login */}
   {/* Trang chính là Login */}
        <Route path="/register" element={<Signup />} /> {/* Trang đăng ký */}
      </Routes>
    
  );
}
