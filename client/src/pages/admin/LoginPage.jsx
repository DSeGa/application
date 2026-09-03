import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client.js';
import { useAuth } from '../../hooks/useAuth.js';
import s from './LoginPage.module.css';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const r = await api.post('/auth/login', { username, password });
      login(r.data.token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={s.page}>
      <div className={s.card}>
        <div className={s.logo}>
          <span className={s.logoAccent}>⬡</span>
          <span className={s.logoText}>Практика — Админ</span>
        </div>
        <h1 className={s.title}>Вход в панель</h1>

        <form onSubmit={handleSubmit} className={s.form}>
          <div className={s.group}>
            <label>Логин</label>
            <input className="field-input" type="text" value={username} autoComplete="username"
              onChange={e => setUsername(e.target.value)} required />
          </div>
          <div className={s.group}>
            <label>Пароль</label>
            <input className="field-input" type="password" value={password} autoComplete="current-password"
              onChange={e => setPassword(e.target.value)} required />
          </div>
          {error && <div className={s.error}>{error}</div>}
          <button className={`btn-primary ${s.submitBtn}`} type="submit" disabled={loading}>
            {loading ? 'Вход…' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  );
}
