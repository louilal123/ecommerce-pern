import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../hooks/useAdmin';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const isAdmin = useAdmin();

  if (isAdmin === null) {
    return <div className="p-8 text-center">Checking permissions…</div>;
  }

  if (!isAdmin) {
    navigate('/login', { replace: true });
    return null;
  }

  return <>{children}</>;
}