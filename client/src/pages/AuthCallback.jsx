import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

export default function AuthCallback() {
  const [params] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    if (!token) { navigate('/login'); return; }
    localStorage.setItem('token', token);
    api.get('/auth/me').then(({ data }) => {
      login(token, data);
      navigate(data.hasGroqKey ? '/' : '/settings');
    }).catch(() => navigate('/login'));
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#888' }}>
      Signing you in...
    </div>
  );
}
