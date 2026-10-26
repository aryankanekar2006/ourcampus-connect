import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import TeacherDashboard from './pages/TeacherDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import { FacultyPendingVerification } from './components/FacultyPendingVerification.jsx';

const MainContent = () => {
  const { user, authLoading } = useAuth();

  if (authLoading) return null;
  if (!user) {
    return <Login />;
  }

  if (user.role === 'teacher') {
    // If faculty is not yet verified by Principal, display verification screen
    if (!user.isVerified) {
      return <FacultyPendingVerification />;
    }
    return <TeacherDashboard />;
  }

  if (user.role === 'admin') {
    return <AdminDashboard />;
  }

  return <StudentDashboard />;
};

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
