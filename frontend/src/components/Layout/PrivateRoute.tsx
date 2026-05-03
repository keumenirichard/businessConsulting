import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {type ReactNode } from 'react';

interface PrivateRouteProps {
  children:    ReactNode;
  rolesPermis?: string[];
}

export default function PrivateRoute({ children, rolesPermis }: PrivateRouteProps) {
  const { isAuthenticated, role } = useAuth();

  // Non connecté → page de login
  if (!isAuthenticated) return <Navigate to="/login" />;

  // Rôle non autorisé → page 403
  if (rolesPermis && role && !rolesPermis.includes(role)) {
    return <Navigate to="/non-autorise" />;
  }

  return <>{children}</>;
}