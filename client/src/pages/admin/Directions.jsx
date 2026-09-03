import { useState, useEffect } from 'react';
import api from '../../api/client.js';
import s from './Directions.module.css';

/* ── Пустые объекты для форм ─────────────────────────────────────────────── */
const emptyDir = {
  code: '', shortName: '', kafName: '',
  headTitle: '', headNameFull: '', kafAddress: '',
};
const emptyPt = { name: '', correctForm: '', supervisorName: '', sortOrder: 0 };

export default function Directions() {
  const [directions, setDirections]   = useState([]);
  const [expanded,   setExpanded]     = useState(null);   // direction id
  const [loading,    setLoading]      = useState(true);

  // Direction form
  const [showDirForm, setShowDirForm] = useState(false);
  const [editDir,     setEditDir]     = useState(null);   // null = create
  const [dirForm,     setDirForm]     = useState(emptyDir);
  const [dirError,    setDirError]    = useState('');
  const [dirSaving,   setDirSaving]   = useState(false);

  // Practice type form
  const [ptForms,    setPtForms]   = useState({});    // { dirId: formData }
  const [ptErrors,   setPtErrors]  = useState({});
  const [ptSaving,   setPtSaving]  = useState({});
  const [editPt,     setEditPt]    = useState(null);  // { dirId, pt }

  function load() {
    setLoading(true);
    api.get('/directions/all')
      .then(r => setDirections(r.data))
      .finally(() => setLoading(false));
  }
  useEffect(load, []);

  /* ── Direction CRUD ──────────────────────────────────────────────────────── */
  function openCreateDir() {
    setEditDir(null); setDirForm(emptyDir); setDirError(''); setShowDirForm(true);
  }
  function openEditDir(dir) {
    setEditDir(dir);
    setDirForm({
      code: dir.code, shortName: dir.shortName, kafName: dir.kafName,
      headTitle: dir.headTitle, headNameFull: dir.headNameFull,
      kafAddress: dir.kafAddress,
    });
    setDirError(''); setShowDirForm(true);
  }

  async function saveDir() {
    setDirSaving(true); setDirError('');
    try {
      if (editDir) {
        await api.put(`/directions/${editDir.id}`, { ...dirForm, isActive: true });
      } else {
        await api.post('/directions', dirForm);
      }
      setShowDirForm(false);
      load();
    } catch (e) {
      setDirError(e.response?.data?.error || 'Ошибка сохранения');
    } finally {
      setDirSaving(false);
    }
  }

  async function deleteDir(id) {
    if (!confirm('Скрыть это направление? Заявления сохранятся.')) return;
    await api.delete(`/directions/${id}`);
    load();
  }

  /* ── Practice type CRUD ──────────────────────────────────────────────────── */
  function ptForm(dirId) { return ptForms[dirId] || emptyPt; }
  function setPtForm(dirId, data) { setPtForms(f => ({ ...f, [dirId]: { ...(f[dirId] || emptyPt), ...data } })); }

  function openEditPt(dirId, pt) {
    setEditPt({ dirId, pt });
    setPtForm(dirId, { name: pt.name, correctForm: pt.correctForm, supervisorName: pt.supervisorName, sortOrder: pt.sortOrder });
  }
  function cancelPtEdit() { setEditPt(null); }

  async function savePt(dirId) {
    setPtSaving(v => ({ ...v, [dirId]: true }));
    setPtErrors(e => ({ ...e, [dirId]: '' }));
    try {
      const form = ptForm(dirId);
      if (editPt && editPt.dirId === dirId) {
        await api.put(`/directions/practice-types/${editPt.pt.id}`, { ...form, isActive: true });
        setEditPt(null);
      } else {
        await api.post(`/directions/${dirId}/practice-types`, form);
      }
      setPtForms(f => ({ ...f, [dirId]: emptyPt }));
      load();
    } catch (e) {
      setPtErrors(v => ({ ...v, [dirId]: e.response?.data?.error || 'Ошибка' }));
    } finally {
      setPtSaving(v => ({ ...v, [dirId]: false }));
    }
  }

  async function deletePt(ptId) {
    if (!confirm('Скрыть этот вид практики?')) return;
    await api.delete(`/directions/practice-types/${ptId}`);
    load();
  }

  /* ── Render ─────────────────────────────────────────────────────────────── */
  if (loading) return <div className={s.loading}>Загрузка…</div>;

  return (
    <div className={s.page}>
      <div className={s.pageHead}>
        <h1 className={s.pageTitle}>Направления подготовки</h1>
        <button className="btn-primary" onClick={openCreateDir}>+ Добавить направление</button>
      </div>

      {/* Форма направления */}
      {showDirForm && (
        <div className={s.formCard}>
          <h2 className={s.formTitle}>{editDir ? 'Редактировать направление' : 'Новое направление'}</h2>
          <div className={s.formGrid}>
            {[
              ['code',         'Код (11.03.01)'],
              ['shortName',    'Короткое название (РСС)'],
              ['kafName',      'Полное название кафедры'],
              ['headTitle',    'Кому (Д.п.): Заведующему каф. …'],
              ['headNameFull', 'ФИО зав. кафедрой (И.п.: Иванов Иван Иванович)'],
              ['kafAddress',   'Адрес кафедры'],
            ].map(([key, label]) => (
              <div key={key} className={s.formGroup}>
                <label>{label}</label>
                <input className="field-input" type="text" value={dirForm[key]}
                  onChange={e => setDirForm(f => ({ ...f, [key]: e.target.value }))} />
              </div>
            ))}
          </div>
          {dirError && <div className={s.error}>{dirError}</div>}
          <div className={s.formActions}>
            <button className="btn-primary" onClick={saveDir} disabled={dirSaving}>
              {dirSaving ? 'Сохранение…' : 'Сохранить'}
            </button>
            <button className="btn-secondary" onClick={() => setShowDirForm(false)}>Отмена</button>
          </div>
        </div>
      )}

      {/* Список направлений */}
      <div className={s.list}>
        {directions.map(dir => (
          <div key={dir.id} className={`${s.dirCard} ${!dir.isActive ? s.inactive : ''}`}>
            {/* Заголовок направления */}
            <div className={s.dirHead} onClick={() => setExpanded(expanded === dir.id ? null : dir.id)}>
              <div className={s.dirInfo}>
                <span className={s.dirCode}>{dir.code}</span>
                <span className={s.dirName}>{dir.shortName}</span>
                {!dir.isActive && <span className={s.badge}>скрыто</span>}
                <span className={s.dirCount}>{dir._count?.applications ?? 0} заявл.</span>
              </div>
              <div className={s.dirActions} onClick={e => e.stopPropagation()}>
                <button className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                  onClick={() => openEditDir(dir)}>Изменить</button>
                <button className="btn-danger" onClick={() => deleteDir(dir.id)}>Скрыть</button>
                <span className={s.chevron} style={{ transform: expanded === dir.id ? 'rotate(180deg)' : 'none' }}>▾</span>
              </div>
            </div>

            {/* Виды практик */}
            {expanded === dir.id && (
              <div className={s.ptSection}>
                <h3 className={s.ptTitle}>Виды практик</h3>

                <table className={s.ptTable}>
                  <thead>
                    <tr>
                      <th>Название</th>
                      <th>Правильная форма (Р.п.)</th>
                      <th>Руководитель</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {dir.practiceTypes.map(pt => (
                      <tr key={pt.id} className={!pt.isActive ? s.inactiveRow : ''}>
                        <td>{pt.name}</td>
                        <td className={s.muted}>{pt.correctForm || '—'}</td>
                        <td>{pt.supervisorName}</td>
                        <td className={s.ptActions}>
                          <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                            onClick={() => openEditPt(dir.id, pt)}>✎</button>
                          <button className="btn-danger" style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                            onClick={() => deletePt(pt.id)}>✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Форма добавления/редактирования вида практики */}
                <div className={s.ptForm}>
                  <h4 className={s.ptFormTitle}>
                    {editPt?.dirId === dir.id ? 'Редактировать вид практики' : 'Добавить вид практики'}
                  </h4>
                  <div className={s.ptFormGrid}>
                    <div className={s.formGroup}>
                      <label>Название практики</label>
                      <input className="field-input" type="text" placeholder="Учебная практика: ознакомительная"
                        value={ptForm(dir.id).name}
                        onChange={e => setPtForm(dir.id, { name: e.target.value })} />
                    </div>
                    <div className={s.formGroup}>
                      <label>Правильная форма (Р.п.)</label>
                      <input className="field-input" type="text" placeholder="учебной практики: ознакомительной"
                        value={ptForm(dir.id).correctForm}
                        onChange={e => setPtForm(dir.id, { correctForm: e.target.value })} />
                    </div>
                    <div className={s.formGroup}>
                      <label>Руководитель практики (И.п., полное ФИО)</label>
                      <input className="field-input" type="text" placeholder="Иванов Иван Иванович"
                        value={ptForm(dir.id).supervisorName}
                        onChange={e => setPtForm(dir.id, { supervisorName: e.target.value })} />
                    </div>
                    <div className={s.formGroup}>
                      <label>Порядок сортировки</label>
                      <input className="field-input" type="number" value={ptForm(dir.id).sortOrder}
                        onChange={e => setPtForm(dir.id, { sortOrder: parseInt(e.target.value) || 0 })} />
                    </div>
                  </div>
                  {ptErrors[dir.id] && <div className={s.error}>{ptErrors[dir.id]}</div>}
                  <div className={s.formActions}>
                    <button className="btn-primary" style={{ padding: '10px 24px' }}
                      onClick={() => savePt(dir.id)} disabled={ptSaving[dir.id]}>
                      {ptSaving[dir.id] ? 'Сохранение…' : (editPt?.dirId === dir.id ? 'Обновить' : 'Добавить')}
                    </button>
                    {editPt?.dirId === dir.id && (
                      <button className="btn-secondary" onClick={cancelPtEdit}>Отмена</button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
