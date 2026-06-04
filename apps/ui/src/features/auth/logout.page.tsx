import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from './auth.api';

/** Pagina senza UI vera: pulisce la sessione e rimanda al login. */
export function LogoutPage() {
  const navigate = useNavigate();

  useEffect(() => {
    logout();
    navigate('/login', { replace: true });
  }, [navigate]);

  return <p className="p-8 text-slate-500">Logout in corso...</p>;
}
