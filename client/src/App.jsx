import { Routes, Route, Navigate } from 'react-router-dom';
import FormPage   from './pages/FormPage.jsx';
import LoginPage  from './pages/admin/LoginPage.jsx';
import AdminLayout from './pages/admin/AdminLayout.jsx';
import Dashboard  from './pages/admin/Dashboard.jsx';
import Directions from './pages/admin/Directions.jsx';
import Applications from './pages/admin/Applications.jsx';
import Settings   from './pages/admin/Settings.jsx';
import { useAuth } from './hooks/useAuth.js';

function PrivateRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/admin/login" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<FormPage />} />

      {/* Admin */}
      <Route path="/admin/login" element={<LoginPage />} />
      <Route path="/admin" element={
        <PrivateRoute><AdminLayout /></PrivateRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"    element={<Dashboard />} />
        <Route path="directions"   element={<Directions />} />
        <Route path="applications" element={<Applications />} />
        <Route path="settings"     element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
