import { useState } from 'react';
import api from '../../api/client.js';
import s from './Settings.module.css';

export default function Settings() {
  const [cur,   setCur]   = useState('');
  const [next,  setNext]  = useState('');
  const [next2, setNext2] = useState('');
  const [msg,   setMsg]   = useState('');
  const [err,   setErr]   = useState('');
  const [saving, setSaving] = useState(false);

  async function changePassword(e) {
    e.preventDefault();
    if (next !== next2) { setErr('Новые пароли не совпадают'); return; }
    if (next.length < 6) { setErr('Пароль должен быть не менее 6 символов'); return; }
    setSaving(true); setErr(''); setMsg('');
    try {
      await api.post('/auth/change-password', { currentPassword: cur, newPassword: next });
      setMsg('Пароль успешно изменён');
      setCur(''); setNext(''); setNext2('');
    } catch (e) {
      setErr(e.response?.data?.error || 'Ошибка');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={s.page}>
      <h1 className={s.pageTitle}>Настройки</h1>

      <div className={s.card}>
        <h2 className={s.cardTitle}>Смена пароля</h2>
        <form onSubmit={changePassword} className={s.form}>
          {[
            ['Текущий пароль', cur, setCur, 'current-password'],
            ['Новый пароль',   next, setNext, 'new-password'],
            ['Повторите новый пароль', next2, setNext2, 'new-password'],
          ].map(([label, val, set, autocomplete]) => (
            <div key={label} className={s.group}>
              <label>{label}</label>
              <input className="field-input" type="password" value={val}
                autoComplete={autocomplete} onChange={e => set(e.target.value)} required />
            </div>
          ))}
          {err && <div className={s.error}>{err}</div>}
          {msg && <div className={s.success}>{msg}</div>}
          <button className="btn-primary" type="submit" disabled={saving}>
            {saving ? 'Сохранение…' : 'Изменить пароль'}
          </button>
        </form>
      </div>

      <div className={`${s.card} ${s.infoCard}`}>
        <h2 className={s.cardTitle}>Шаблоны документов</h2>
        <p>Файлы шаблонов хранятся в папке <code>templates/</code> в корне проекта. Название: <code>N_template_тип.docx</code>, где N — количество практик (1–3), тип — <code>kaf</code> или <code>org</code>.</p>
        <p style={{ marginTop: 8 }}>Итого 6 файлов: <code>1_template_kaf.docx</code>, <code>2_template_kaf.docx</code>, <code>3_template_kaf.docx</code> и аналогично для <code>_org</code>.</p>
        <p style={{ marginTop: 8 }}>Поля нумеруются: <code>{'{'}practice1{'}'}</code>, <code>{'{'}supervisorName1{'}'}</code>, <code>{'{'}fromDate1{'}'}</code>, <code>{'{'}toDate1{'}'}</code> и т.д.</p>
      </div>
    </div>
  );
}
