// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Unverified from './pages/Unverified';
import EmailConfirmation from './pages/EmailConfirmation';
import Home from './pages/Home';
import Maps from './pages/Maps';
import Likes from './pages/Likes';
import Chats from './pages/Chats';
import Profile from './pages/Profile';
import Viewers from './pages/Viewers';
import ProtectedRoute from './components/ProtectedRoute';

import SelectCountry from './pages/SelectCountry';
import CompleteProfile from './pages/CompleteProfile';
import UploadPhotos from './pages/UploadPhotos';
import SelectInterests from './pages/SelectInterests';
import SelectMatch from './pages/SelectMatch';
import EditProfile from './pages/EditProfile';
import EditPhoto from './pages/EditPhoto';
import { UserProvider } from './context/UserContext'; // Importer le UserProvider
import UsersProfile from './pages/UsersProfile';

const App = () => {
  return (
    <UserProvider> {/* Envelopper toute l'application */}
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unverified" element={<Unverified />} />
          <Route path="/confirm/:token" element={<EmailConfirmation />} />

          {/* Protected Routes */}
          <Route path="/select-country" element={
            <ProtectedRoute>
              <SelectCountry />
            </ProtectedRoute>
          } />
          <Route path="/complete-profile" element={
            <ProtectedRoute>
              <CompleteProfile />
            </ProtectedRoute>
          } />
          <Route path="/upload-photos" element={
            <ProtectedRoute>
              <UploadPhotos />
            </ProtectedRoute>
          } />
          <Route path="/select-interests" element={
            <ProtectedRoute>
              <SelectInterests />
            </ProtectedRoute>
          } />
          <Route path="/select-match" element={
            <ProtectedRoute>
              <SelectMatch />
            </ProtectedRoute>
          } />
          <Route path="/home" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/maps" element={
            <ProtectedRoute>
              <Maps />
            </ProtectedRoute>
          } />
          <Route path="/likes" element={
            <ProtectedRoute>
              <Likes />
            </ProtectedRoute>
          } />
          <Route path="/chats" element={
            <ProtectedRoute>
              <Chats />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/edit-profile" element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          } />
          <Route path="/edit-photo" element={
            <ProtectedRoute>
              <EditPhoto />
            </ProtectedRoute>
          } />
          <Route path="/viewers" element={
            <ProtectedRoute>
              <Viewers />
            </ProtectedRoute>
          } />
          <Route path="/user/:userId" element={<UsersProfile />} />
          <Route path="/" element={<Login />} />
          
          {/* Catch-all route - redirect to home if authenticated, login if not */}
          <Route path="*" element={
            <ProtectedRoute>
              <Navigate to="/home" replace />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </UserProvider>
  );
};

export default App;
