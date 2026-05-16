import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../hooks/useAdmin';
import LoadingSpinner from './LoadingSpinner';   

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const isAdmin = useAdmin();

  if (isAdmin === null) {
    return <LoadingSpinner />;  
  }

  if (!isAdmin) {
    navigate('/login', { replace: true });
    return null;
  }

  return <>{children}</>;
}