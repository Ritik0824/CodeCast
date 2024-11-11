// src/components/LogoutButton.js
import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    toast.success('Logged out');
    navigate('/login');
  };

  return <button onClick={handleLogout}>Log Out</button>;
};

export default LogoutButton;
