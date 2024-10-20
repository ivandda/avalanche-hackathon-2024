'use client'
import React from 'react';
import { useAuthContext } from '@/app/context/AuthContext';
import LoginView from './LoginView';
import GovernmentDashboard from './GovernmentDashboard';
import UniversityDashboard from './UniversityDashboard';
import StudentDashboard from './StudentDashboard';

const MainDashboard: React.FC = () => {
  const { userType } = useAuthContext();

  switch (userType) {
    case 'government':
      return  <StudentDashboard />;
    case 'university':
      return <UniversityDashboard />;
    case 'student':
      return <StudentDashboard />;
    default:
      return <StudentDashboard />;
  }
};

export default MainDashboard;