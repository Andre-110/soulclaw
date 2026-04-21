import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AppGate() {
  const navigate = useNavigate();

  useEffect(() => {
    const activated = localStorage.getItem('star_activated');
    if (activated === '1') {
      navigate('/avatar', { replace: true });
    } else {
      navigate('/forge', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0F0F1E' }}>
      <div className="w-8 h-8 rounded-full animate-spin"
        style={{ border: '2px solid rgba(108,92,231,0.2)', borderTopColor: '#6C5CE7' }} />
    </div>
  );
}
