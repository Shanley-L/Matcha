import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Unverified from './pages/Unverified';
import EmailConfirmation from './pages/EmailConfirmation';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unverified" element={<Unverified />} />
        <Route path="/confirm/:token" element={<EmailConfirmation />} />
        <Route path="/*" element={<Login/>} />
        <Route path="/" element={<Login/>} />
      </Routes>
    </Router>
  );
};

export default App;
