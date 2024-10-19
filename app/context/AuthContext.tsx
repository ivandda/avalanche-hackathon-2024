'use client'
import React, { createContext, useState, useContext, ReactNode } from 'react';

interface AuthContextProps {
  userType: 'university' | 'student' | 'government';
  userId: number;
  login: (walletAddress: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userType, setUserType] = useState<'university' | 'student' | 'government'>();
  const [userId, setUserId] = useState<number>();

  const login = (walletAddress: string) => {
    fetch(`/api/user/${walletAddress}`)
      .then(response => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      return response.json();
      })
      .then(data => {
        const { userType, user } = data;
        if (userType !== 'university' && userType !== 'student' && userType !== 'government') {
          throw new Error('Invalid user type');
        }
        setUserType(userType);
        setUserId(user.id);
      })
      .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
      });
  }

  const logout = () => {
    setUserType(undefined);
    setUserId(0);
  }

  return (
    <AuthContext.Provider value={{ userType, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AppProvider');
  }
  return context;
};