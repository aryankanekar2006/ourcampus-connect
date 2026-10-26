import React from 'react';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({
  children,
  allowedRoles,
  fallbackComponent
}) => {
  const { user } = useAuth();

  if (!user) {
    return fallbackComponent ? <>{fallbackComponent}</> : null;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md border border-red-100">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-2xl">
            !
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-sm text-gray-600 mb-6">
            You are logged in as <span className="font-semibold text-red-600 capitalize">{user.role}</span>.
            This area requires <span className="font-semibold">{allowedRoles.join(', ')}</span> access.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
