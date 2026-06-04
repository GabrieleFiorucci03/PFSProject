import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Avvolge le rotte che richiedono autenticazione: se manca il token JWT
 * reindirizza al login, altrimenti renderizza i figli.
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const token = localStorage.getItem('access_token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
