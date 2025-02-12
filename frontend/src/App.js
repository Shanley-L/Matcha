// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Unverified from './pages/Unverified';
import EmailConfirmation from './pages/EmailConfirmation';
import Home from './pages/Home';
import Maps from './pages/Maps';
import Likes from './pages/Likes';
import Chats from './pages/Chats';
import Profile from './pages/Profile';

import SelectCountry from './pages/SelectCountry';
import CompleteProfile from './pages/CompleteProfile';
import UploadPhotos from './pages/UploadPhotos';
import SelectInterests from './pages/SelectInterests';
import SelectMatch from './pages/SelectMatch';
import { UserProvider } from './context/UserContext'; // Importer le UserProvider

const App = () => {
  return (
    <UserProvider> {/* Envelopper toute l'application */}
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unverified" element={<Unverified />} />
          <Route path="/confirm/:token" element={<EmailConfirmation />} />
          <Route path="/select-country" element={<SelectCountry />} />
          <Route path="/complete-profile" element={<CompleteProfile />} />
          <Route path="/upload-photos" element={<UploadPhotos />} />
          <Route path="/select-interests" element={<SelectInterests />} />
          <Route path="/select-match" element={<SelectMatch />} />
          <Route path="/home" element={<Home />} />
          <Route path="/maps" element={<Maps />} />
          <Route path="/likes" element={<Likes />} />
          <Route path="/chats" element={<Chats />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/" element={<Login />} />
        </Routes>
      </Router>
    </UserProvider>
  );
};

export default App;
