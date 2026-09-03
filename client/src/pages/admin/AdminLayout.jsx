import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import s from './AdminLayout.module.css';

const NAV = [
  { to: '/admin/dashboard',    icon: '▤', label: 'Дашборд' },
  { to: '/admin/directions',   icon: '⊞', label: 'Направления' },
  { to: '/admin/applications', icon: '≡', label: 'Заявления' },
  { to: '/admin/settings',     icon: '⚙', label: 'Настройки' },
];

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate   = useNavigate();

  function handleLogout() {
    logout();
    navigate('/admin/login');
  }

  return (
    <div className={s.shell}>
      <aside className={s.sidebar}>
        <div className={s.brand}>
          <span className={s.brandIcon}>⬡</span>
          <span className={s.brandText}>Практика</span>
        </div>

        <nav className={s.nav}>
          {NAV.map(({ to, icon, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) =>
              `${s.navItem} ${isActive ? s.navActive : ''}`
            }>
              <span className={s.navIcon}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className={s.sidebarBottom}>
          <a href="/" target="_blank" className={s.viewSite}>
            <span>↗</span> Открыть форму
          </a>
          <button className={s.logoutBtn} onClick={handleLogout}>
            Выйти
          </button>
        </div>
      </aside>

      <main className={s.main}>
        <Outlet />
      </main>
    </div>
  );
}
