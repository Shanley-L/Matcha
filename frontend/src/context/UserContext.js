// UserContext.js
import React, { createContext, useState, useContext } from 'react';

// Création du contexte utilisateur
const UserContext = createContext();

// Hook pour accéder au contexte dans n'importe quel composant
export const useUser = () => useContext(UserContext);

// Provider pour envelopper l'application et fournir l'état global
export const UserProvider = ({ children }) => {
    const [userData, setUserData] = useState({
        firstname: '',
        birthdate: '',
        country: '',
        gender: '',
        looking_for: '',
        interests: [],
        photos: [],
        matchType: '',
        is_first_login: 0,
        city: '',
        suburb: ''
    });

    return (
        <UserContext.Provider value={{ userData, setUserData }}>
            {children}
        </UserContext.Provider>
    );
};
